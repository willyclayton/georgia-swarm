import { getStandings, getSwarmRecord } from '@/lib/data';
import { StandingsTable } from '@/components/standings/StandingsTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { Trophy } from 'lucide-react';

export const revalidate = 3600;

export default function StandingsPage() {
  const standings = getStandings();
  const record = getSwarmRecord();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="Standings" subtitle="2024–25 NLL Regular Season" />

      {/* Swarm rank highlight */}
      <div className="flex items-center gap-3 bg-swarm-blue/10 border border-swarm-blue/30 rounded-2xl p-4 mb-5">
        <Trophy className="text-swarm-gold" size={24} />
        <div>
          <p className="text-swarm-text font-bold">Georgia Swarm</p>
          <p className="text-swarm-muted text-sm">{record.wins}W – {record.losses}L · 2024–25</p>
        </div>
      </div>

      {standings.length > 0 ? (
        <StandingsTable teams={standings} />
      ) : (
        <div className="text-center py-20 text-swarm-muted">
          Standings not yet loaded. Run the data fetch script.
        </div>
      )}
    </div>
  );
}
