#!/usr/bin/env node
/**
 * Georgia Swarm Data Fetcher
 * ES Module, Node 20, zero external dependencies
 * Run: node scripts/fetch-data.js
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../src/data');

const TEAM_ID = 539;
const SEASON_ID = 225;
const NLL_API = 'https://nllstatsapp.aordev.com/';
const SWARM_AJAX = 'https://georgiaswarm.com/wp-admin/admin-ajax.php';

// Ensure data directory exists
mkdirSync(DATA_DIR, { recursive: true });

function write(filename, data) {
  const path = join(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`✓ Written: ${filename}`);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchSwarmAjax(action, extra = {}) {
  const body = new URLSearchParams({
    action: 'nll_sportlogiq',
    team_id: String(TEAM_ID),
    ...extra,
  });
  const res = await fetch(SWARM_AJAX, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`AJAX HTTP ${res.status}`);
  return res.json();
}

// ── 1. Standings ─────────────────────────────────────────────────────────────
async function fetchStandings() {
  console.log('Fetching standings...');
  const url = `${NLL_API}?data_type=standings&season_id=${SEASON_ID}&phase=REG`;
  const raw = await fetchJson(url);
  // Normalize to array of teams
  const teams = raw?.data?.standings ?? raw?.standings ?? raw ?? [];
  write('standings.json', teams);
}

// ── 2. Schedule ───────────────────────────────────────────────────────────────
async function fetchSchedule() {
  console.log('Fetching schedule...');
  const url = `${NLL_API}?data_type=schedule&mode=rest_of_season&phase=REG&season_id=${SEASON_ID}&team_id=${TEAM_ID}`;
  const raw = await fetchJson(url);
  const games = raw?.data?.schedule ?? raw?.schedule ?? raw ?? [];
  write('schedule.json', games);
}

// ── 3. Roster + Player Stats ─────────────────────────────────────────────────
async function fetchRoster() {
  console.log('Fetching roster...');
  const raw = await fetchSwarmAjax('nll_sportlogiq', { getTeamPlayerListing: 'true' });
  const players = raw?.data?.players ?? raw?.players ?? raw ?? [];

  // Normalize player objects
  const normalized = players.map((p) => ({
    id: p.player_id ?? p.id,
    name: p.player_name ?? p.name ?? '',
    slug: slugify(p.player_name ?? p.name ?? ''),
    number: p.jersey_number ?? p.number ?? '',
    position: normalizePosition(p.position ?? p.player_position ?? ''),
    hometown: p.hometown ?? '',
    college: p.college ?? '',
    age: p.age ?? null,
    height: p.height ?? '',
    weight: p.weight ?? '',
    headshotUrl: p.headshot_url ?? p.image ?? '',
    stats: {
      gp: p.games_played ?? p.stats?.gp ?? 0,
      goals: p.goals ?? p.stats?.goals ?? 0,
      assists: p.assists ?? p.stats?.assists ?? 0,
      points: p.points ?? p.stats?.points ?? 0,
      plusMinus: p.plus_minus ?? p.stats?.plus_minus ?? 0,
      pims: p.penalty_minutes ?? p.stats?.pims ?? 0,
      saves: p.saves ?? p.stats?.saves ?? null,
      savesPct: p.save_percentage ?? p.stats?.save_pct ?? null,
    },
    gameLog: p.game_log ?? [],
  }));

  write('roster.json', normalized);
}

// ── 4. Team Stat Leaders ──────────────────────────────────────────────────────
async function fetchTeamStats() {
  console.log('Fetching team stats...');
  const raw = await fetchSwarmAjax('nll_sportlogiq', { getStatLeaders: 'true' });
  write('team-stats.json', raw?.data ?? raw ?? {});
}

// ── 5. News + Highlights (scrape georgiaswarm.com) ────────────────────────────
async function fetchNewsAndHighlights() {
  console.log('Fetching news & highlights...');
  const res = await fetch('https://georgiaswarm.com/news/all-news/');
  const html = await res.text();

  // ── Highlights: extract YouTube video IDs
  const ytRegex = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/g;
  const titleRegex = /<title[^>]*>([^<]+)<\/title>/;
  const highlights = [];
  const seen = new Set();
  let match;
  while ((match = ytRegex.exec(html)) !== null) {
    const videoId = match[1];
    if (!seen.has(videoId)) {
      seen.add(videoId);
      highlights.push({
        videoId,
        title: extractNearbyText(html, match.index, 200),
        date: extractNearbyDate(html, match.index),
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      });
    }
  }
  write('highlights.json', highlights);

  // ── News: extract news card articles
  const news = [];
  // Look for article/post patterns
  const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/g;
  const postRegex = /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/g;

  let artMatch;
  while ((artMatch = articleRegex.exec(html)) !== null && news.length < 12) {
    const content = artMatch[1];
    const item = parseNewsItem(content);
    if (item) news.push(item);
  }

  // Fallback: scrape h2/h3 links with images
  if (news.length === 0) {
    const linkRegex = /<a[^>]*href="(https?:\/\/georgiaswarm\.com\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null && news.length < 12) {
      const [, url, inner] = linkMatch;
      if (url.includes('/news/')) {
        const titleMatch = /<(?:h[1-6]|strong)[^>]*>([^<]+)<\/(?:h[1-6]|strong)>/.exec(inner);
        const imgMatch = /src="([^"]+)"/i.exec(inner);
        if (titleMatch) {
          news.push({
            headline: titleMatch[1].trim(),
            url,
            image: imgMatch ? imgMatch[1] : null,
            date: extractNearbyDate(html, linkMatch.index),
          });
        }
      }
    }
  }
  write('news.json', news);
}

// ── 6. Playoff Bracket ────────────────────────────────────────────────────────
async function fetchPlayoffBracket() {
  console.log('Fetching playoff bracket...');
  try {
    const url = `${NLL_API}?data_type=standings&season_id=${SEASON_ID}&phase=POST`;
    const raw = await fetchJson(url);
    write('playoff-bracket.json', raw?.data ?? raw ?? {});
  } catch {
    console.log('Playoffs not yet available — writing empty bracket');
    write('playoff-bracket.json', {});
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizePosition(pos) {
  const p = pos.toUpperCase();
  if (p === 'F' || p.includes('FWD') || p.includes('FORWARD')) return 'Forward';
  if (p === 'D' || p.includes('DEF') || p.includes('DEFENSE')) return 'Defense';
  if (p === 'T' || p.includes('TRANS')) return 'Transition';
  if (p === 'G' || p.includes('GOAL')) return 'Goalie';
  return pos;
}

function extractNearbyText(html, index, range) {
  const snippet = html.slice(Math.max(0, index - range), index + range);
  const headingMatch = /<(?:h[1-6]|strong|b)[^>]*>([^<]{5,80})<\/(?:h[1-6]|strong|b)>/.exec(snippet);
  return headingMatch ? headingMatch[1].trim() : 'Swarm Highlight';
}

function extractNearbyDate(html, index) {
  const snippet = html.slice(Math.max(0, index - 300), index + 300);
  const dateMatch = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+ \d{1,2},?\s*\d{4})/.exec(snippet);
  return dateMatch ? dateMatch[1] : null;
}

function parseNewsItem(html) {
  const headingMatch = /<(?:h[1-6])[^>]*>([^<]{5,120})<\/(?:h[1-6])>/.exec(html);
  const linkMatch = /href="(https?:\/\/[^"]+)"/.exec(html);
  const imgMatch = /src="([^"]*(?:jpg|jpeg|png|webp)[^"]*)"/.exec(html);
  if (!headingMatch || !linkMatch) return null;
  return {
    headline: headingMatch[1].replace(/&#?\w+;/g, '').trim(),
    url: linkMatch[1],
    image: imgMatch ? imgMatch[1] : null,
    date: extractNearbyDate(html, 0),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Georgia Swarm Data Fetch ===\n');
  const tasks = [
    fetchStandings,
    fetchSchedule,
    fetchRoster,
    fetchTeamStats,
    fetchNewsAndHighlights,
    fetchPlayoffBracket,
  ];

  for (const task of tasks) {
    try {
      await task();
    } catch (err) {
      console.error(`✗ ${task.name}: ${err.message}`);
    }
  }

  console.log('\n✓ Data fetch complete');
}

main();
