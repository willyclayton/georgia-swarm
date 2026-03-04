'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, BarChart2, Play, TrendingUp, Trophy, Star } from 'lucide-react';

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/roster', label: 'Roster', icon: Users },
  { href: '/stats', label: 'Stats', icon: BarChart2 },
  { href: '/standings', label: 'Stands', icon: TrendingUp },
  { href: '/highlights', label: 'Clips', icon: Play },
  { href: '/playoffs', label: 'Playoffs', icon: Trophy },
  { href: '/fan-zone', label: 'Fan Zone', icon: Star },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-swarm-navy border-t border-swarm-border">
      <div className="flex items-center">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex-1 flex flex-col items-center justify-center py-2 min-h-[52px]"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-x-0.5 inset-y-0.5 bg-swarm-blue/25 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                />
              )}
              <Icon
                size={18}
                className={`relative z-10 transition-colors ${isActive ? 'text-swarm-gold' : 'text-swarm-muted'}`}
              />
              <span className={`relative z-10 text-[8px] mt-0.5 uppercase tracking-wide font-medium transition-colors ${isActive ? 'text-swarm-gold' : 'text-swarm-muted'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
