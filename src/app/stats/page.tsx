'use client';
import { useState } from 'react';
import { getRoster } from '@/lib/data';
import { LeaderBoard } from '@/components/stats/LeaderBoard';
import { PageHeader } from '@/components/ui/PageHeader';

const TABS = [
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'points', label: 'Points' },
  { key: 'saves', label: 'Saves' },
] as const;

type Tab = typeof TABS[number]['key'];

export default function StatsPage() {
  const players = getRoster();
  const [tab, setTab] = useState<Tab>('goals');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="Stats" subtitle="2025–26 Season Leaders" />

      {/* Tab bar */}
      <div className="flex gap-1 bg-swarm-surface rounded-2xl p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-swarm-card text-swarm-gold shadow-sm'
                : 'text-swarm-muted hover:text-swarm-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {players.length > 0 ? (
        <div className="bg-swarm-card rounded-2xl p-5 border border-swarm-border">
          <LeaderBoard
            players={players}
            stat={tab}
            label={TABS.find((t) => t.key === tab)?.label ?? ''}
          />
        </div>
      ) : (
        <div className="text-center py-20 text-swarm-muted">
          Stats not yet loaded. Run the data fetch script.
        </div>
      )}
    </div>
  );
}
