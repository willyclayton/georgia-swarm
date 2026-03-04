'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import logoMapData from '@/data/team-logos.json';

const swarmLogoUrl = (logoMapData as Record<string, string>)['GEO'] ?? '';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/roster', label: 'Roster' },
  { href: '/stats', label: 'Stats' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/standings', label: 'Standings' },
  { href: '/highlights', label: 'Highlights' },
  { href: '/fan-zone', label: 'Fan Zone' },
  { href: '/playoffs', label: 'Playoffs' },
];

export function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="hidden md:flex sticky top-0 z-50 bg-swarm-navy border-b border-swarm-border items-center px-6 h-14">
      <Link href="/" className="flex items-center gap-2 mr-8 flex-shrink-0">
        <div className="w-8 h-8 bg-swarm-gold/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {swarmLogoUrl ? (
            <Image src={swarmLogoUrl} alt="Georgia Swarm" width={32} height={32} className="object-contain" />
          ) : (
            <span className="text-swarm-gold font-bold text-xs">GS</span>
          )}
        </div>
        <span className="font-bold text-swarm-text text-sm tracking-wide">GEORGIA SWARM</span>
      </Link>
      <div className="flex items-center gap-1 flex-1">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'text-swarm-gold' : 'text-swarm-muted hover:text-swarm-text'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="top-nav-indicator"
                  className="absolute inset-0 bg-swarm-blue/20 rounded-lg"
                  transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </div>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="ml-4 p-2 rounded-lg text-swarm-muted hover:text-swarm-text hover:bg-swarm-surface transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </nav>
  );
}
