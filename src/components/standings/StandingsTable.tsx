'use client';
import { TeamLogo } from '@/components/ui/TeamLogo';
import type { StandingsTeam } from '@/lib/data';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const row = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

type Props = { teams: StandingsTeam[] };

export function StandingsTable({ teams }: Props) {
  const sorted = [...teams].sort((a, b) => b.pct - a.pct || b.wins - a.wins);

  return (
    <div className="bg-swarm-card rounded-2xl border border-swarm-border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 text-swarm-muted text-xs font-medium border-b border-swarm-border">
        <span>Team</span>
        <span className="text-center">W</span>
        <span className="text-center">L</span>
        <span className="text-center">PCT</span>
        <span className="text-center">+/-</span>
      </div>
      <motion.div
        className="divide-y divide-swarm-border"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {sorted.map((team, i) => {
          const isSwarm = team.team_code === 'GEO';
          const diff = (team.gf ?? 0) - (team.ga ?? 0);
          return (
            <motion.div
              key={team.team_code}
              variants={row}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 items-center px-4 py-3 ${
                isSwarm ? 'border-l-[3px] border-l-swarm-gold bg-swarm-blue/15' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-swarm-muted text-xs w-4">{i + 1}</span>
                <TeamLogo teamCode={team.team_code} teamName={team.team_name} size={32} />
                <span className={`text-sm font-medium ${isSwarm ? 'text-swarm-gold' : 'text-swarm-text'}`}>
                  {team.team_name}
                </span>
              </div>
              <span className="text-center font-display font-bold text-swarm-text tabular-nums">{team.wins}</span>
              <span className="text-center font-display font-bold text-swarm-text tabular-nums">{team.losses}</span>
              <span className="text-center text-swarm-muted text-sm tabular-nums">{(team.pct * 100).toFixed(0)}%</span>
              <span className={`text-center text-sm tabular-nums ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-swarm-muted'}`}>
                {diff > 0 ? '+' : ''}{diff}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
