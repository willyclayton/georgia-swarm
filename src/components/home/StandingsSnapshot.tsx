import { TeamLogo } from '@/components/ui/TeamLogo';
import type { StandingsTeam } from '@/lib/data';
import Link from 'next/link';

type Props = { teams: StandingsTeam[] };

export function StandingsSnapshot({ teams }: Props) {
  const east = teams
    .filter((t) => !t.division || t.division === 'East')
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  return (
    <div className="bg-swarm-card rounded-2xl border border-swarm-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-swarm-border">
        <span className="text-swarm-text font-semibold text-sm">NLL East Standings</span>
        <Link href="/standings" className="text-swarm-blue-light text-xs hover:text-swarm-gold transition-colors">
          Full table →
        </Link>
      </div>
      <div className="divide-y divide-swarm-border">
        {east.map((team, i) => {
          const isSwarm = team.team_code === 'GEO';
          return (
            <div
              key={team.team_code}
              className={`flex items-center gap-3 px-4 py-2.5 ${isSwarm ? 'bg-swarm-blue/15' : ''}`}
            >
              <span className="text-swarm-muted text-xs w-4">{i + 1}</span>
              <TeamLogo teamCode={team.team_code} teamName={team.team_name} size={28} />
              <span className={`flex-1 text-sm font-medium ${isSwarm ? 'text-swarm-gold' : 'text-swarm-text'}`}>
                {team.team_name}
              </span>
              <div className="flex gap-4 text-xs text-swarm-muted tabular-nums">
                <span className="text-swarm-text font-medium">{team.wins}-{team.losses}</span>
                <span>{(team.pct * 100).toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
