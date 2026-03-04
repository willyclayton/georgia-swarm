'use client';
import { useState, useCallback } from 'react';

const POSITIONS = ['All', 'Forward', 'Transition', 'Defense', 'Goalie'] as const;
const SORTS = [
  { value: 'name', label: 'Name' },
  { value: 'number', label: '#' },
  { value: 'goals', label: 'Goals' },
  { value: 'points', label: 'Points' },
] as const;

type Position = typeof POSITIONS[number];
type Sort = typeof SORTS[number]['value'];

type Props = {
  onPositionChange: (pos: Position) => void;
  onSortChange: (sort: Sort) => void;
};

export function PlayerFilter({ onPositionChange, onSortChange }: Props) {
  const [activePos, setActivePos] = useState<Position>('All');
  const [activeSort, setActiveSort] = useState<Sort>('name');

  const handlePos = useCallback((pos: Position) => {
    setActivePos(pos);
    onPositionChange(pos);
  }, [onPositionChange]);

  const handleSort = useCallback((sort: Sort) => {
    setActiveSort(sort);
    onSortChange(sort);
  }, [onSortChange]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => handlePos(pos)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activePos === pos
                ? 'bg-swarm-gold text-swarm-navy'
                : 'bg-swarm-surface text-swarm-muted hover:text-swarm-text'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-swarm-muted text-xs">Sort:</span>
        <div className="flex gap-1">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSort(s.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeSort === s.value
                  ? 'bg-swarm-blue/25 text-swarm-gold'
                  : 'text-swarm-muted hover:text-swarm-text'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
