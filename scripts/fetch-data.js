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

// Map team_id → code (mirrors src/lib/data.ts)
const ID_TO_CODE = {
  539: 'GEO', 540: 'SSK', 525: 'COL', 543: 'VAN', 545: 'OTT',
  515: 'TOR', 509: 'BUF', 542: 'SD', 546: 'ROC', 549: 'LV',
  544: 'HFX', 541: 'PHI', 524: 'CGY', 548: 'OSH',
};

// ── 1. Standings ─────────────────────────────────────────────────────────────
async function fetchStandings() {
  console.log('Fetching standings...');
  const url = `${NLL_API}?data_type=standings&season_id=${SEASON_ID}&phase=REG`;
  const raw = await fetchJson(url);
  // Normalize to array of teams
  const teams = raw?.data?.standings ?? raw?.standings ?? raw ?? [];
  write('standings.json', teams);

  // Extract logo URLs into a code → URL map
  // API shape: { standings_pretty: { "": [teams], "East": [teams], ... } }
  const prettyDivisions = raw?.standings_pretty ?? raw?.data?.standings_pretty ?? {};
  let rawTeams = Object.values(prettyDivisions).flat();
  const logoMap = {};
  for (const team of rawTeams) {
    const code = ID_TO_CODE[team.team_id] ?? team.team_code;
    if (code && team.logo_url) logoMap[code] = team.logo_url;
  }
  write('team-logos.json', logoMap);
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
  const url = `${NLL_API}?data_type=players&team_id=${TEAM_ID}&season_id=${SEASON_ID}`;
  const raw = await fetchJson(url);
  // Response shape: { map: { "<personId>": { player fields... } } }
  const map = raw?.map ?? {};

  const players = Object.values(map).map((p) => {
    // headshot: correct path is sizes.player_headshot or top-level url
    const headshotUrl =
      p.headshot?.sizes?.player_headshot ??
      p.headshot?.url ?? '';

    // matches: {"season": N} — games played count only, no per-game stats
    const gp = p.matches?.season ?? 0;

    return {
      id:          p.personId ?? p.champion_data_id,
      name:        p.fullname ?? p.displayName ?? '',
      slug:        slugify(p.fullname ?? p.displayName ?? ''),
      number:      p.jerseyNumber ?? '',
      position:    normalizePosition(p.position ?? ''),
      hometown:    p.hometown ?? '',
      college:     '',
      age:         p.ageToday ?? null,
      height:      p.height ?? '',
      weight:      p.weight ? `${p.weight} lbs` : '',
      headshotUrl,
      stats: {
        gp,
        goals:     p.goals     ?? p.g   ?? 0,
        assists:   p.assists   ?? p.a   ?? 0,
        points:    p.points    ?? p.pts ?? 0,
        plusMinus: p.plus_minus ?? p.plusMinus ?? p.pm ?? 0,
        pims:      p.penalty_minutes ?? p.pims ?? p.pim ?? 0,
        saves:     p.position === 'G' ? (p.saves ?? null) : null,
        savesPct:  p.position === 'G' ? (p.save_percentage ?? null) : null,
      },
      gameLog: [],
    };
  });

  write('roster.json', players);
}

// ── 4. Player Stats (NLL stats_players API) ───────────────────────────────────
async function fetchPlayerStats() {
  console.log('Fetching player stats...');
  try {
    const url = `${NLL_API}?data_type=stats_players&season_id=${SEASON_ID}`;
    const raw = await fetchJson(url);
    const allStats = raw?.stats ?? [];

    // Filter to Georgia Swarm players by team_id
    const swarmStats = allStats.filter(p =>
      String(p.team?.champion_data_id) === String(TEAM_ID)
    );
    console.log(`  Found ${swarmStats.length} Swarm players in stats feed`);

    // Build map keyed by personId string
    const statsMap = new Map(swarmStats.map(p => [
      String(p.id),
      {
        gp:      parseInt(p.GAME_PLAYED)     || 0,
        goals:   parseInt(p.GOAL)            || 0,
        assists: parseInt(p.ASSIST_GOAL)     || 0,
        points:  parseInt(p.POINTS)          || 0,
        pims:    parseInt(p.PENALTY_MINUTES) || 0,
      },
    ]));

    // Merge into roster.json by personId
    const { readFileSync } = await import('fs');
    const players = JSON.parse(readFileSync(join(DATA_DIR, 'roster.json'), 'utf-8'));
    let merged = 0;
    for (const p of players) {
      const s = statsMap.get(String(p.id));
      if (s) { Object.assign(p.stats, s); merged++; }
    }
    write('roster.json', players);
    console.log(`  Merged stats for ${merged} players`);
  } catch (err) {
    console.log(`Player stats unavailable: ${err.message}`);
  }
}

// ── 5. Box Scores (per-game NLL API) ──────────────────────────────────────────
async function fetchBoxScores() {
  console.log('Fetching box scores...');
  const { readFileSync } = await import('fs');

  const rawSchedule = JSON.parse(readFileSync(join(DATA_DIR, 'schedule.json'), 'utf-8'));
  const completedGames = [];
  for (const week of rawSchedule) {
    if (!week.matches) continue;
    for (const match of Object.values(week.matches)) {
      if (match.status?.code === 'COMP' &&
          (match.squads?.home?.id === TEAM_ID || match.squads?.away?.id === TEAM_ID)) {
        completedGames.push(match.id);
      }
    }
  }
  console.log(`  Found ${completedGames.length} completed games`);

  let boxScores = {};
  try {
    boxScores = JSON.parse(readFileSync(join(DATA_DIR, 'box-scores.json'), 'utf-8'));
  } catch { /* first run */ }

  for (const gameId of completedGames) {
    if (boxScores[gameId]?.quarter_scores?.length > 0) continue;

    try {
      const url = `${NLL_API}?data_type=game_detail&match_id=${gameId}&season_id=${SEASON_ID}`;
      const raw = await fetchJson(url);

      // Quarter scores: q1-q4, plus OT if it occurred (ot1 is a number, not "-")
      const bs = raw?.box_score;
      const quarter_scores = ['q1', 'q2', 'q3', 'q4']
        .map(q => ({
          home: typeof bs?.home?.[q] === 'number' ? bs.home[q] : 0,
          away: typeof bs?.away?.[q] === 'number' ? bs.away[q] : 0,
        }));
      if (typeof bs?.home?.ot1 === 'number') {
        quarter_scores.push({ home: bs.home.ot1, away: bs.away.ot1 });
      }

      // Determine Swarm side (home or away)
      const swarmSide = raw?.details?.home?.id === TEAM_ID ? 'home' : 'away';

      // Top performers from stat leaders on Swarm's side
      const leaders = raw?.stats_players?.leaders?.[swarmSide] ?? {};
      const playerMap = raw?.players ?? {};
      const seen = new Set();
      const top_performers = Object.entries(leaders)
        .map(([stat, l]) => ({
          name: playerMap[l.personId]?.fullname ?? '',
          stat,
          value: l.value ?? 0,
        }))
        .filter(p => p.name && p.value > 0 && !seen.has(p.name) && seen.add(p.name))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      boxScores[gameId] = { quarter_scores, top_performers };
      console.log(`  ✓ game ${gameId}: ${quarter_scores.length}Q, ${top_performers.length} performers`);
    } catch (err) {
      console.log(`  ✗ game ${gameId}: ${err.message}`);
    }
  }

  write('box-scores.json', boxScores);
}

// ── 6. Team Stat Leaders ──────────────────────────────────────────────────────
async function fetchTeamStats() {
  console.log('Fetching team stats...');
  try {
    const raw = await fetchSwarmAjax('nll_sportlogiq', { getStatLeaders: 'true' });
    write('team-stats.json', raw?.data ?? raw ?? {});
  } catch {
    console.log('Team stats unavailable — writing empty object');
    write('team-stats.json', {});
  }
}

// ── 7. News + Highlights (scrape georgiaswarm.com) ────────────────────────────
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

// ── 8. Playoff Bracket ────────────────────────────────────────────────────────
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
    fetchBoxScores,
    fetchRoster,
    fetchPlayerStats,
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
