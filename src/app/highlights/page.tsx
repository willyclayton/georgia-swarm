'use client';
import { getHighlights } from '@/lib/data';
import { PageHeader } from '@/components/ui/PageHeader';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const card = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function HighlightsPage() {
  const highlights = getHighlights();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader title="Highlights" subtitle="Game highlights & top plays" />

      {/* Broadcast section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-swarm-border" />
        <span className="bg-swarm-gold/15 text-swarm-gold font-display font-black text-xs tracking-[0.2em] px-3 py-1 rounded-full uppercase">
          Latest Videos
        </span>
        <div className="h-px flex-1 bg-swarm-border" />
      </div>

      {highlights.length === 0 ? (
        <div className="text-center py-20 text-swarm-muted">
          Highlights not yet loaded. Run the data fetch script.
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {highlights.map((h) => (
            <motion.div key={h.videoId} variants={card} whileHover={{ y: -3 }}>
              <a
                href={`https://www.youtube.com/watch?v=${h.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-swarm-card rounded-2xl border border-swarm-border overflow-hidden hover:border-swarm-blue/50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-swarm-surface">
                  <Image
                    src={h.thumbnail}
                    alt={h.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3">
                  <h3 className="text-swarm-text text-sm font-medium line-clamp-2 group-hover:text-swarm-gold transition-colors">
                    {h.title}
                  </h3>
                  {h.date && (
                    <p className="text-swarm-muted text-xs mt-1">{h.date}</p>
                  )}
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
