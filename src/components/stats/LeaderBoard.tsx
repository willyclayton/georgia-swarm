import { StatBar } from './StatBar';
import type { Player } from '@/lib/data';

type StatKey = 'goals' | 'assists' | 'points' | 'saves';

type Props = {
  players: Player[];
  stat: StatKey;
  label: string;
};

export function LeaderBoard({ players, stat, label }: Props) {
  const sorted = [...players]
    .filter((p) => {
      if (stat === 'saves') return p.position === 'Goalie' && (p.stats.saves ?? 0) > 0;
      return (p.stats[stat] ?? 0) > 0;
    })
    .sort((a, b) => (b.stats[stat] ?? 0) - (a.stats[stat] ?? 0))
    .slice(0, 5);

  if (sorted.length === 0) {
    return (
      <p className="text-swarm-muted text-sm text-center py-8">
        Season stats not yet available — check back after game updates.
      </p>
    );
  }

  const max = sorted[0].stats[stat] ?? 1;

  return (
    <div className="space-y-4">
      {sorted.map((player, i) => (
        <StatBar
          key={player.id}
          name={player.name}
          value={player.stats[stat] ?? 0}
          max={max}
          rank={i + 1}
        />
      ))}
    </div>
  );
}
