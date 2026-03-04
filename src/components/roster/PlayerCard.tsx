'use client';
import Link from 'next/link';
import Image from 'next/image';
import type { Player } from '@/lib/data';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = { player: Player };

const POSITION_COLORS: Record<string, string> = {
  Forward: 'text-orange-400 bg-orange-400/10',
  Defense: 'text-blue-400 bg-blue-400/10',
  Transition: 'text-purple-400 bg-purple-400/10',
  Goalie: 'text-green-400 bg-green-400/10',
};

export function PlayerCard({ player }: Props) {
  const posColor = POSITION_COLORS[player.position] ?? 'text-swarm-muted bg-swarm-surface';
  const keyStatLabel = player.position === 'Goalie' ? 'SVS' : 'PTS';
  const keyStatVal = player.position === 'Goalie' ? (player.stats.saves ?? 0) : player.stats.points;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <Link
        href={`/roster/${player.slug}`}
        className="block bg-swarm-card rounded-2xl border border-swarm-border overflow-hidden hover:border-swarm-blue/50 transition-colors group"
      >
        {/* Headshot */}
        <div className="relative h-40 bg-swarm-surface">
          {player.headshotUrl ? (
            <Image
              src={player.headshotUrl}
              alt={player.name}
              fill
              className="object-cover object-top"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <User size={48} className="text-swarm-muted/40" />
            </div>
          )}
          {/* Number badge */}
          <div className="absolute top-2.5 left-2.5 bg-swarm-navy text-swarm-gold border-2 border-swarm-gold font-display font-black text-[22px] leading-none px-2.5 py-[3px] rounded-lg min-w-[42px] text-center">
            {player.number}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-swarm-text font-semibold text-sm group-hover:text-swarm-gold transition-colors line-clamp-1">
            {player.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${posColor}`}>
              {player.position}
            </span>
            <span className="text-swarm-muted text-xs">
              <span className="text-swarm-gold font-bold">{keyStatVal}</span> {keyStatLabel}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
