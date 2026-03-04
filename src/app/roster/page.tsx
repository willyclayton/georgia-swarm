'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getRoster } from '@/lib/data';
import { PlayerFilter } from '@/components/roster/PlayerFilter';
import { PlayerCard } from '@/components/roster/PlayerCard';
import { PageHeader } from '@/components/ui/PageHeader';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

type Position = 'All' | 'Forward' | 'Transition' | 'Defense' | 'Goalie';
type Sort = 'name' | 'number' | 'goals' | 'points';

export default function RosterPage() {
  const allPlayers = getRoster();
  const [position, setPosition] = useState<Position>('All');
  const [sort, setSort] = useState<Sort>('name');

  const filtered = useMemo(() => {
    let players = position === 'All' ? allPlayers : allPlayers.filter((p) => p.position === position);
    return [...players].sort((a, b) => {
      switch (sort) {
        case 'number': return Number(a.number) - Number(b.number);
        case 'goals': return b.stats.goals - a.stats.goals;
        case 'points': return b.stats.points - a.stats.points;
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [allPlayers, position, sort]);

  if (allPlayers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <PageHeader title="Roster" subtitle="2025–26 Season" />
        <div className="text-center py-20 text-swarm-muted">
          Roster data not yet loaded. Run the data fetch script.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader title="Roster" subtitle={`${filtered.length} players`} />
      <div className="mb-5">
        <PlayerFilter onPositionChange={setPosition} onSortChange={setSort} />
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      >
        {filtered.map((player) => (
          <motion.div key={player.id} variants={item}>
            <PlayerCard player={player} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
