'use client';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

type GamePoint = { goals: number; assists: number; points: number };

type Props = {
  gameLog: GamePoint[];
  stat?: 'goals' | 'assists' | 'points';
};

export function StatSparkline({ gameLog, stat = 'points' }: Props) {
  if (!gameLog.length) return <div className="h-12 flex items-center justify-center text-swarm-muted text-xs">No game data</div>;

  const data = gameLog.map((g, i) => ({ game: i + 1, value: g[stat] }));

  return (
    <div className="h-14">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f5b942"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#f5b942' }}
          />
          <Tooltip
            contentStyle={{ background: '#1a2d52', border: '1px solid #1e3a6e', borderRadius: 8, fontSize: 12 }}
            labelFormatter={(l) => `Game ${l}`}
            formatter={(v) => [v, stat.charAt(0).toUpperCase() + stat.slice(1)]}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
