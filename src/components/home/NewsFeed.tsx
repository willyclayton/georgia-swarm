import type { NewsItem } from '@/lib/data';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

type Props = { news: NewsItem[] };

export function NewsFeed({ news }: Props) {
  if (news.length === 0) return null;

  return (
    <div>
      <h2 className="text-swarm-text font-semibold text-sm mb-3">Latest News</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {news.slice(0, 4).map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-swarm-card rounded-2xl border border-swarm-border overflow-hidden hover:border-swarm-blue/60 transition-colors group"
          >
            {item.image && (
              <div className="relative h-36 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.headline}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-3">
              <h3 className="text-swarm-text text-sm font-medium line-clamp-2 group-hover:text-swarm-gold transition-colors">
                {item.headline}
              </h3>
              {item.date && (
                <p className="text-swarm-muted text-xs mt-1">{item.date}</p>
              )}
              <div className="flex items-center gap-1 mt-2 text-swarm-blue-light text-xs">
                Read more <ExternalLink size={10} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
