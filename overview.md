# Georgia Swarm Fan App

A mobile-first progressive web app for fans of the Georgia Swarm, a professional lacrosse team in the National Lacrosse League (NLL). Built as a personal project to explore real-time sports data pipelines and modern React patterns.

## Purpose

The NLL doesn't have a great mobile experience for following individual teams. This app gives Swarm fans a fast, focused hub for everything that matters during the season: live scores, standings, the full roster with stats, game-by-game schedules, highlights, and playoff bracket tracking — all in a polished dark-themed UI that feels native on mobile.

## Features

- **Live score bar** — polls a server-side API route every 60 seconds during game days
- **Schedule** — full season with completed game results and upcoming games, per-game box score detail pages
- **Standings** — division and league-wide standings with win/loss records
- **Roster** — filterable and sortable player cards with headshots, position badges, and season stats; individual player detail pages
- **Stats leaderboards** — team leaders in goals, assists, points, and penalty minutes
- **Highlights** — auto-scraped YouTube highlight videos from the team's website
- **Playoffs** — bracket view for postseason
- **Fan Zone** — team news feed

## Data Architecture

All data lives in `src/data/*.json`. A Node.js fetch script (`scripts/fetch-data.js`) pulls from two sources:

- **NLL Stats API** (`nllstatsapp.aordev.com`) — schedule, standings, roster, and player stats
- **Georgia Swarm website** — HTML-scraped news articles and YouTube highlight links

A **GitHub Actions cron job** runs the fetch script daily at 8am ET, commits the updated JSON files, and pushes — triggering an automatic Vercel redeploy. No database, no backend runtime cost.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-based config, no tailwind.config.ts) |
| Components | shadcn/ui + Radix UI primitives |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Theming | next-themes |
| Data fetching | GitHub Actions cron → static JSON |
| Deployment | Vercel (SSG + ISR) |
| CI/CD | GitHub Actions |

## Architecture Decisions

**Static JSON over a database.** NLL data changes once a day at most. Serving pre-built JSON files from the CDN is faster, cheaper, and simpler than a live database query on every request. The tradeoff is a ~24-hour data lag, which is acceptable for a fan app.

**App Router with ISR.** Most pages are statically generated at build time (`generateStaticParams` for roster and schedule detail pages). The live score endpoint is a lightweight API route that hits the NLL API on-demand only when a game is in progress.

**No external dependencies in the data script.** `scripts/fetch-data.js` is a plain ES module using only Node built-ins and the native `fetch` API, so it runs in GitHub Actions with zero install step overhead.

## Pages (30 total, fully SSG/ISR)

```
/                   Home — next game hero + quick stats
/schedule           Full season schedule
/schedule/[game-id] Box score detail
/standings          League standings
/roster             Player grid (filterable by position, sortable)
/roster/[slug]      Individual player page
/stats              Team stat leaderboards
/highlights         Video highlight feed
/playoffs           Bracket view
/fan-zone           News feed
```
