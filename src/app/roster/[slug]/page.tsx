import { getRoster, getPlayerBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { User } from 'lucide-react';
import { StatSparkline } from '@/components/roster/StatSparkline';

export const revalidate = 3600;

export async function generateStaticParams() {
  return getRoster().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);
  if (!player) notFound();

  const stats = [
    { label: 'GP', value: player.stats.gp },
    { label: 'Goals', value: player.stats.goals },
    { label: 'Assists', value: player.stats.assists },
    { label: 'Points', value: player.stats.points },
    { label: '+/-', value: player.stats.plusMinus },
    { label: 'PIMs', value: player.stats.pims },
    ...(player.position === 'Goalie' ? [
      { label: 'Saves', value: player.stats.saves ?? '–' },
      { label: 'SV%', value: player.stats.savesPct ? `${(player.stats.savesPct * 100).toFixed(1)}%` : '–' },
    ] : []),
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-swarm-blue via-swarm-surface to-swarm-navy rounded-2xl overflow-hidden border border-swarm-border mb-5">
        <div className="flex items-end gap-4 p-6 pb-4">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-swarm-navy flex-shrink-0">
            {player.headshotUrl ? (
              <Image src={player.headshotUrl} alt={player.name} fill className="object-cover object-top" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <User size={40} className="text-swarm-muted/40" />
              </div>
            )}
          </div>
          <div>
            <div className="text-swarm-gold text-sm font-medium mb-1">#{player.number} · {player.position}</div>
            <h1 className="text-swarm-text text-2xl font-bold">{player.name}</h1>
          </div>
        </div>
      </div>

      {/* Bio */}
      {(player.hometown || player.college || player.age || player.height) && (
        <div className="bg-swarm-card rounded-2xl p-4 border border-swarm-border mb-4">
          <h2 className="text-swarm-muted text-xs font-medium uppercase tracking-wider mb-3">Bio</h2>
          <div className="grid grid-cols-2 gap-3">
            {player.hometown && (
              <div>
                <p className="text-swarm-muted text-xs">Hometown</p>
                <p className="text-swarm-text text-sm font-medium">{player.hometown}</p>
              </div>
            )}
            {player.college && (
              <div>
                <p className="text-swarm-muted text-xs">College</p>
                <p className="text-swarm-text text-sm font-medium">{player.college}</p>
              </div>
            )}
            {player.age && (
              <div>
                <p className="text-swarm-muted text-xs">Age</p>
                <p className="text-swarm-text text-sm font-medium">{player.age}</p>
              </div>
            )}
            {player.height && (
              <div>
                <p className="text-swarm-muted text-xs">Height / Weight</p>
                <p className="text-swarm-text text-sm font-medium">{player.height}{player.weight ? ` / ${player.weight}` : ''}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-swarm-card rounded-2xl p-4 border border-swarm-border mb-4">
        <h2 className="text-swarm-muted text-xs font-medium uppercase tracking-wider mb-3">2024–25 Stats</h2>
        <div className="grid grid-cols-4 gap-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-swarm-gold text-xl font-bold tabular-nums">{value}</p>
              <p className="text-swarm-muted text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sparkline */}
      {player.gameLog.length > 0 && (
        <div className="bg-swarm-card rounded-2xl p-4 border border-swarm-border">
          <h2 className="text-swarm-muted text-xs font-medium uppercase tracking-wider mb-3">
            Points Per Game
          </h2>
          <StatSparkline gameLog={player.gameLog} stat="points" />
        </div>
      )}
    </div>
  );
}
