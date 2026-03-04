'use client';
import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';

type LiveGame = {
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  period?: string;
  clock?: string;
};

export function LiveScoreBar() {
  const [game, setGame] = useState<LiveGame | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/live-score');
        const data = await res.json();
        if (data.live) setGame(data.game);
        else setGame(null);
      } catch {
        // silent
      }
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  if (!game) return null;

  return (
    <div className="bg-swarm-blue/20 border border-swarm-blue/40 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Radio size={16} className="text-red-400 animate-pulse" />
        <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live</span>
        {game.period && (
          <span className="text-swarm-muted text-xs">· {game.period}</span>
        )}
      </div>
      <div className="flex items-center gap-4 text-swarm-text font-bold">
        <span>{game.home_team}</span>
        <span className="text-swarm-gold text-xl tabular-nums">
          {game.home_score} – {game.away_score}
        </span>
        <span>{game.away_team}</span>
      </div>
    </div>
  );
}
