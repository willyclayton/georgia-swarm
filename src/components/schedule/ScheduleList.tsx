'use client';
import Link from 'next/link';
import { TeamLogo } from '@/components/ui/TeamLogo';
import type { Game } from '@/lib/data';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

type Props = { games: Game[] };

export function ScheduleList({ games }: Props) {
  if (games.length === 0) {
    return <div className="text-center py-20 text-swarm-muted">No games found.</div>;
  }

  return (
    <motion.div
      className="space-y-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {games.map((game) => {
        const isFinal = game.status === 'final';
        const isLive = game.status === 'live';
        const swarmScore = game.is_home ? game.home_score : game.away_score;
        const oppScore = game.is_home ? game.away_score : game.home_score;
        const win = isFinal && swarmScore !== undefined && oppScore !== undefined && swarmScore > oppScore;
        const loss = isFinal && swarmScore !== undefined && oppScore !== undefined && swarmScore < oppScore;

        const dateStr = new Date(game.date).toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric',
        });

        return (
          <motion.div key={game.game_id} variants={item} whileHover={{ x: 3 }}>
            <Link
              href={`/schedule/${game.game_id}`}
              className="flex items-center gap-3 bg-swarm-card rounded-2xl border border-swarm-border p-4 hover:border-swarm-blue/50 transition-colors"
            >
              {/* Date */}
              <div className="w-12 flex-shrink-0 text-center">
                <p className="text-swarm-muted text-xs">{dateStr.split(',')[0]}</p>
                <p className="text-swarm-text text-sm font-medium">{dateStr.split(',')[1]?.trim()}</p>
              </div>

              {/* Home/Away indicator */}
              <div className="w-6 text-center">
                <span className={`font-display font-bold text-sm ${game.is_home ? 'text-swarm-gold' : 'text-swarm-muted'}`}>
                  {game.is_home ? 'vs' : '@'}
                </span>
              </div>

              {/* Opponent */}
              <TeamLogo teamCode={game.opponent_code} teamName={game.opponent} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-swarm-text font-medium text-sm truncate">{game.opponent}</p>
                {game.time && !isFinal && (
                  <p className="text-swarm-muted text-xs">{game.time} ET</p>
                )}
              </div>

              {/* Score / status */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isFinal && swarmScore !== undefined && (
                  <>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      win ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {win ? 'W' : 'L'}
                    </span>
                    <span className="font-display font-bold text-lg tabular-nums text-swarm-text">
                      {swarmScore}–{oppScore}
                    </span>
                  </>
                )}
                {isLive && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 animate-pulse">
                    LIVE
                  </span>
                )}
                {!isFinal && !isLive && (
                  <span className="text-swarm-muted text-xs">Scheduled</span>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
