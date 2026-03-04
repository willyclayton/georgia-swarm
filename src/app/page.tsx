import { getNextGame, getLastGame, getStandings, getNews, getSwarmRecord } from '@/lib/data';
import { NextGameHero } from '@/components/home/NextGameHero';
import { LiveScoreBar } from '@/components/home/LiveScoreBar';
import { RecentResult } from '@/components/home/RecentResult';
import { StandingsSnapshot } from '@/components/home/StandingsSnapshot';
import { NewsFeed } from '@/components/home/NewsFeed';
import { Trophy } from 'lucide-react';

export const revalidate = 300;

export default function HomePage() {
  const nextGame = getNextGame();
  const lastGame = getLastGame();
  const standings = getStandings();
  const news = getNews();
  const record = getSwarmRecord();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Record badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-swarm-gold/10 border border-swarm-gold/20 rounded-full px-3 py-1">
          <Trophy size={12} className="text-swarm-gold" />
          <span className="text-swarm-gold text-xs font-semibold">
            {record.wins}–{record.losses} · 2025–26 Season
          </span>
        </div>
      </div>

      {/* Live score (only shows during active games) */}
      <LiveScoreBar />

      {/* Next game hero */}
      {nextGame ? (
        <NextGameHero game={nextGame} />
      ) : (
        <div className="bg-swarm-card rounded-2xl p-6 border border-swarm-border text-center">
          <p className="text-swarm-muted">No upcoming games scheduled.</p>
        </div>
      )}

      {/* Recent result + standings (side by side on wider mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lastGame && <RecentResult game={lastGame} />}
        {standings.length > 0 && <StandingsSnapshot teams={standings} />}
      </div>

      {/* News */}
      <NewsFeed news={news} />
    </div>
  );
}
