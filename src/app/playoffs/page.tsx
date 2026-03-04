import { getPlayoffBracket } from '@/lib/data';
import { PageHeader } from '@/components/ui/PageHeader';
import { Trophy } from 'lucide-react';

export const revalidate = 3600;

type BracketTeam = {
  team_code: string;
  team_name: string;
  wins: number;
};

type Matchup = {
  home: BracketTeam;
  away: BracketTeam;
  round: string;
};

export default function PlayoffsPage() {
  const bracket = getPlayoffBracket() as { matchups?: Matchup[] };
  const hasData = bracket && bracket.matchups && bracket.matchups.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="Playoffs" subtitle="2025–26 NLL Postseason" />

      {!hasData ? (
        <div className="bg-swarm-card rounded-2xl p-10 border border-swarm-border text-center">
          <Trophy size={48} className="text-swarm-gold/30 mx-auto mb-4" />
          <h2 className="text-swarm-text font-bold text-lg mb-2">Bracket Coming Soon</h2>
          <p className="text-swarm-muted text-sm">
            The playoff bracket will appear here once the postseason begins.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bracket.matchups!.map((matchup, i) => (
            <div key={i} className="bg-swarm-card rounded-2xl border border-swarm-border overflow-hidden">
              <div className="px-4 py-2 bg-swarm-surface border-b border-swarm-border">
                <span className="text-swarm-muted text-xs font-medium uppercase tracking-wider">
                  {matchup.round}
                </span>
              </div>
              <div className="divide-y divide-swarm-border">
                {[matchup.home, matchup.away].map((team) => {
                  const isSwarm = team.team_code === 'GEO';
                  return (
                    <div
                      key={team.team_code}
                      className={`flex items-center justify-between px-4 py-3 ${isSwarm ? 'bg-swarm-blue/10' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: isSwarm ? '#1d4fbd' : '#374151' }}
                        >
                          {team.team_code.slice(0, 3)}
                        </div>
                        <span className={`font-medium text-sm ${isSwarm ? 'text-swarm-gold' : 'text-swarm-text'}`}>
                          {team.team_name}
                        </span>
                      </div>
                      <span className="text-swarm-gold font-bold text-lg tabular-nums">
                        {team.wins}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
