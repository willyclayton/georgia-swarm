'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

type Props = {
  name: string;
  value: number;
  max: number;
  rank: number;
  headshotUrl?: string;
};

export function StatBar({ name, value, max, rank, headshotUrl }: Props) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        {/* Rank */}
        <span className="font-display font-black text-2xl text-swarm-gold w-6 text-center leading-none">
          {rank}
        </span>

        {/* Headshot */}
        {headshotUrl ? (
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-swarm-surface">
            <Image
              src={headshotUrl}
              alt={name}
              width={30}
              height={30}
              className="object-cover object-top w-full h-full"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-swarm-surface flex-shrink-0" />
        )}

        {/* Name */}
        <span className="flex-1 text-swarm-text text-sm font-medium truncate">{name}</span>

        {/* Value */}
        <span className="font-display font-black text-2xl text-swarm-gold leading-none tabular-nums">
          {value}
        </span>
      </div>

      {/* Gradient bar */}
      <div className="h-[2px] bg-swarm-surface rounded-full overflow-hidden ml-9">
        <motion.div
          className="h-full bg-gradient-to-r from-swarm-blue to-swarm-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: rank * 0.06, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
