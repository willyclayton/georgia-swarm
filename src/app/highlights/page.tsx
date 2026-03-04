import { getHighlights } from '@/lib/data';
import { PageHeader } from '@/components/ui/PageHeader';
import Image from 'next/image';
import { Play } from 'lucide-react';

export const revalidate = 3600;

export default function HighlightsPage() {
  const highlights = getHighlights();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader title="Highlights" subtitle="Game highlights & top plays" />

      {highlights.length === 0 ? (
        <div className="text-center py-20 text-swarm-muted">
          Highlights not yet loaded. Run the data fetch script.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {highlights.map((h) => (
            <a
              key={h.videoId}
              href={`https://www.youtube.com/watch?v=${h.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-swarm-card rounded-2xl border border-swarm-border overflow-hidden hover:border-swarm-blue/50 transition-all"
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
          ))}
        </div>
      )}
    </div>
  );
}
