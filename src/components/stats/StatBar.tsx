type Props = {
  name: string;
  value: number;
  max: number;
  rank: number;
};

export function StatBar({ name, value, max, rank }: Props) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-swarm-muted text-xs w-4">{rank}</span>
          <span className="text-swarm-text text-sm font-medium">{name}</span>
        </div>
        <span className="text-swarm-gold font-bold tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 bg-swarm-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-swarm-blue to-swarm-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
