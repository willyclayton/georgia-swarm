# Georgia Swarm — Claude Code Instructions

## Stack
- **Next.js** (App Router), **Tailwind CSS v4** (CSS-based config via `src/app/globals.css`), **shadcn/ui**, **framer-motion**, **recharts**, **lucide-react**, **next-themes**
- Deployed on Vercel; GitHub Actions cron fetches data daily at 8am ET

## Key Constants
- Georgia Swarm `team_id`: **539**, `season_id`: **225**
- Swarm schedule code: **"GA"**; standings code: **"GEO"**

## Data Architecture
- All data lives in `src/data/*.json` — written by `scripts/fetch-data.js`, never manually edited
- All data access goes through `src/lib/data.ts` — typed helpers + normalization
- Run `node scripts/fetch-data.js` to refresh data locally
- Data files: `schedule.json`, `standings.json`, `roster.json`, `highlights.json`, `news.json`, `team-stats.json`, `playoff-bracket.json`, `box-scores.json`, `team-logos.json`

## Tailwind v4
- **No `tailwind.config.ts`** — all theme config is in `src/app/globals.css` under `@theme inline {}`
- Custom colors: `bg-swarm-navy`, `text-swarm-gold`, etc.

## API Sources
- Schedule/standings: `https://nllstatsapp.aordev.com/` (NLL stats API)
  - Standings format: `{ standings_pretty: { "": [teams] } }`
  - Schedule format: array of weeks, each with `matches` as an object (not array)
- Roster/stats: WordPress AJAX at `georgiaswarm.com/wp-admin/admin-ajax.php`
  - Player stats action: `aor_get_all_player_stats` — returns HTML DataTable
  - May return 400 in CI (needs browser cookies); wrapped in try/catch
- Box scores: NLL API per-game endpoints (`data_type=scoring|game_stats|game|match_stats`)

## Client vs Server Components
These **must** be `'use client'`:
- `TeamLogo` — has `onError` state handler
- `BottomNav` / `TopNav` — framer-motion `layoutId`
- `NextGameHero` — countdown timer with `setInterval`
- `LiveScoreBar` — polls `/api/live-score` every 60s

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build (must be clean / zero errors)
- `node scripts/fetch-data.js` — manual data refresh
