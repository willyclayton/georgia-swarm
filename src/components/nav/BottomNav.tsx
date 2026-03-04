'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Users, BarChart2, Play, TrendingUp, MoreHorizontal, Trophy, Star } from 'lucide-react';
import { useState } from 'react';

const PRIMARY_TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/roster', label: 'Roster', icon: Users },
  { href: '/standings', label: 'Standings', icon: TrendingUp },
  { href: '/highlights', label: 'Highlights', icon: Play },
  { href: '/stats', label: 'Stats', icon: BarChart2 },
];

const MORE_TABS = [
  { href: '/fan-zone', label: 'Fan Zone', icon: Star },
  { href: '/playoffs', label: 'Playoffs', icon: Trophy },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_TABS.some(
    (t) => pathname === t.href || pathname.startsWith(t.href)
  );

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 right-4 z-50 bg-swarm-card border border-swarm-border rounded-2xl p-2 shadow-xl md:hidden"
            >
              {MORE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href || pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive ? 'bg-swarm-blue/25 text-swarm-gold' : 'text-swarm-muted hover:text-swarm-text hover:bg-swarm-surface'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </Link>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-swarm-navy border-t border-swarm-border">
        <div className="flex items-center">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex-1 flex flex-col items-center justify-center py-2 min-h-[56px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-x-1 inset-y-1 bg-swarm-blue/25 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                  />
                )}
                <Icon
                  size={22}
                  className={`relative z-10 transition-colors ${isActive ? 'text-swarm-gold' : 'text-swarm-muted'}`}
                />
                <span className={`relative z-10 text-[10px] mt-0.5 font-medium transition-colors ${isActive ? 'text-swarm-gold' : 'text-swarm-muted'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="relative flex-1 flex flex-col items-center justify-center py-2 min-h-[56px]"
          >
            {isMoreActive && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-x-1 inset-y-1 bg-swarm-blue/25 rounded-xl"
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              />
            )}
            <MoreHorizontal
              size={22}
              className={`relative z-10 transition-colors ${isMoreActive || moreOpen ? 'text-swarm-gold' : 'text-swarm-muted'}`}
            />
            <span className={`relative z-10 text-[10px] mt-0.5 font-medium transition-colors ${isMoreActive || moreOpen ? 'text-swarm-gold' : 'text-swarm-muted'}`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
