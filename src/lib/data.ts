import scheduleRaw from '@/data/schedule.json';
import standingsRaw from '@/data/standings.json';
import rosterRawImport from '@/data/roster.json';
import highlightsData from '@/data/highlights.json';
import newsData from '@/data/news.json';
import teamStatsData from '@/data/team-stats.json';
import playoffBracketData from '@/data/playoff-bracket.json';

const rosterRaw: unknown[] = Array.isArray(rosterRawImport) ? rosterRawImport : [];

export type Game = {
  game_id: string;
  date: string;
  time?: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  status: 'final' | 'scheduled' | 'live';
  is_home: boolean;
  opponent: string;
  opponent_code: string;
  venue?: string;
  quarter_scores?: { home: number; away: number }[];
  top_performers?: TopPerformer[];
  highlight_video_id?: string;
};

export type TopPerformer = {
  name: string;
  stat: string;
  value: string | number;
};

export type Player = {
  id: string | number;
  name: string;
  slug: string;
  number: string | number;
  position: string;
  hometown: string;
  college: string;
  age: number | null;
  height: string;
  weight: string;
  headshotUrl: string;
  stats: {
    gp: number;
    goals: number;
    assists: number;
    points: number;
    plusMinus: number;
    pims: number;
    saves: number | null;
    savesPct: number | null;
  };
  gameLog: { game_id: string; goals: number; assists: number; points: number }[];
};

export type StandingsTeam = {
  team_code: string;
  team_name: string;
  wins: number;
  losses: number;
  pct: number;
  gf: number;
  ga: number;
  division?: string;
};

export type Highlight = {
  videoId: string;
  title: string;
  date: string | null;
  thumbnail: string;
};

export type NewsItem = {
  headline: string;
  url: string;
  image: string | null;
  date: string | null;
};

const SWARM_ID = 539;

// ── Schedule normalization ─────────────────────────────────────────────────────
function normalizeSchedule(): Game[] {
  type RawMatch = {
    id: number;
    squads: {
      home: { id: number; code: string; name: string; nickname: string; displayName?: string; score?: { goals: number } };
      away: { id: number; code: string; name: string; nickname: string; displayName?: string; score?: { goals: number } };
    };
    date: { startDate: string; startTime: string };
    status: { code: string };
    venue?: { name: string };
    winningSquadId?: number;
  };
  type RawWeek = { matches: Record<string, RawMatch> };
  const weeks = (scheduleRaw as unknown) as RawWeek[];

  const games: Game[] = [];

  for (const week of weeks) {
    if (!week.matches) continue;
    for (const match of Object.values(week.matches)) {
      const { squads, date, status, venue } = match;
      const swarmIsHome = squads.home.id === SWARM_ID;
      const swarmIsAway = squads.away.id === SWARM_ID;
      if (!swarmIsHome && !swarmIsAway) continue; // not a Swarm game

      const opponent = swarmIsHome ? squads.away : squads.home;
      const swarmSquad = swarmIsHome ? squads.home : squads.away;
      const _ = swarmSquad; // used for clarity

      const statusCode = status.code; // 'COMP' | 'SCHED' | 'LIVE'
      let gameStatus: 'final' | 'scheduled' | 'live' = 'scheduled';
      if (statusCode === 'COMP') gameStatus = 'final';
      else if (statusCode === 'LIVE' || statusCode === 'INPROGRESS') gameStatus = 'live';

      games.push({
        game_id: String(match.id),
        date: date.startDate + 'T' + date.startTime,
        time: date.startTime?.slice(0, 5),
        home_team: squads.home.displayName ?? `${squads.home.name} ${squads.home.nickname}`,
        away_team: squads.away.displayName ?? `${squads.away.name} ${squads.away.nickname}`,
        home_score: squads.home.score?.goals,
        away_score: squads.away.score?.goals,
        status: gameStatus,
        is_home: swarmIsHome,
        opponent: opponent.displayName ?? `${opponent.name} ${opponent.nickname}`,
        opponent_code: opponent.code,
        venue: venue?.name,
      });
    }
  }

  // Sort by date ascending
  return games.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ── Standings normalization ────────────────────────────────────────────────────
function normalizeStandings(): StandingsTeam[] {
  // Handle both array format and { standings_pretty: { "": [...] } } format
  const raw = standingsRaw as unknown;

  let teams: {
    team_id?: number;
    team_code?: string;
    name?: string;
    team_name?: string;
    city?: string;
    nickname?: string;
    wins?: number;
    losses?: number;
    win_percentage?: string | number;
    pct?: number;
    goals_for?: number;
    gf?: number;
    goals_against?: number;
    ga?: number;
  }[] = [];

  if (Array.isArray(raw)) {
    teams = raw;
  } else if (raw && typeof raw === 'object' && 'standings_pretty' in (raw as object)) {
    const sp = (raw as { standings_pretty: Record<string, unknown[]> }).standings_pretty;
    teams = Object.values(sp).flat() as typeof teams;
  }

  // Map team_id to code for Swarm teams
  const ID_TO_CODE: Record<number, string> = {
    539: 'GEO', 540: 'SSK', 525: 'COL', 543: 'VAN', 545: 'OTT',
    515: 'TOR', 509: 'BUF', 542: 'SD', 546: 'ROC', 549: 'LV',
    544: 'HFX', 541: 'PHI', 524: 'CGY', 548: 'OSH',
  };

  return teams.map((t) => {
    const code = t.team_code ?? (t.team_id ? ID_TO_CODE[t.team_id] ?? String(t.team_id) : '');
    return {
      team_code: code,
      team_name: t.team_name ?? t.name ?? (t.city && t.nickname ? `${t.city} ${t.nickname}` : ''),
      wins: t.wins ?? 0,
      losses: t.losses ?? 0,
      pct: typeof t.win_percentage === 'string'
        ? parseFloat(t.win_percentage)
        : (t.pct ?? t.win_percentage ?? 0) as number,
      gf: t.goals_for ?? t.gf ?? 0,
      ga: t.goals_against ?? t.ga ?? 0,
    };
  });
}

// ── Roster normalization ───────────────────────────────────────────────────────
function normalizeRoster(): Player[] {
  if (!Array.isArray(rosterRaw) || rosterRaw.length === 0) return [];
  return rosterRaw as Player[];
}

// ── Memoized getters ──────────────────────────────────────────────────────────
let _schedule: Game[] | null = null;
let _standings: StandingsTeam[] | null = null;
let _roster: Player[] | null = null;

export function getSchedule(): Game[] {
  if (!_schedule) _schedule = normalizeSchedule();
  return _schedule;
}

export function getRoster(): Player[] {
  if (!_roster) _roster = normalizeRoster();
  return _roster;
}

export function getStandings(): StandingsTeam[] {
  if (!_standings) _standings = normalizeStandings();
  return _standings;
}

export function getHighlights(): Highlight[] {
  return highlightsData as Highlight[];
}

export function getNews(): NewsItem[] {
  return newsData as NewsItem[];
}

export function getTeamStats() {
  return teamStatsData;
}

export function getPlayoffBracket() {
  return playoffBracketData;
}

export function getNextGame(): Game | null {
  const now = new Date();
  const schedule = getSchedule();
  return (
    schedule.find((g) => g.status === 'scheduled' && new Date(g.date) >= now) ??
    null
  );
}

export function getLastGame(): Game | null {
  const schedule = getSchedule();
  const finalGames = schedule.filter((g) => g.status === 'final');
  return finalGames[finalGames.length - 1] ?? null;
}

export function getPlayerBySlug(slug: string): Player | null {
  return getRoster().find((p) => p.slug === slug) ?? null;
}

export function getGameById(id: string): Game | null {
  return getSchedule().find((g) => g.game_id === id) ?? null;
}

export function getSwarmRecord(): { wins: number; losses: number } {
  const schedule = getSchedule();
  let wins = 0, losses = 0;
  for (const game of schedule) {
    if (game.status !== 'final') continue;
    const swarmScore = game.is_home ? game.home_score! : game.away_score!;
    const oppScore = game.is_home ? game.away_score! : game.home_score!;
    if (swarmScore > oppScore) wins++;
    else losses++;
  }
  return { wins, losses };
}
