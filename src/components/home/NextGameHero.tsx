'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import type { Game } from '@/lib/data';
import logoMapData from '@/data/team-logos.json';

const swarmLogoUrl = (logoMapData as Record<string, string>)['GEO'] ?? '';

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-swarm-navy/60 rounded-xl px-3 py-2 min-w-[56px]">
      <span className="text-2xl font-bold text-swarm-gold tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-swarm-muted text-[10px] uppercase tracking-wider">{label}</span>
    </div>
  );
}

type Props = { game: Game };

export function NextGameHero({ game }: Props) {
  const timeLeft = useCountdown(game.date);
  const gameDate = new Date(game.date);
  const isHome = game.is_home;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-swarm-blue via-swarm-surface to-swarm-navy border border-swarm-border p-6">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-swarm-gold/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-swarm-blue/20 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-swarm-gold/20 text-swarm-gold text-xs font-semibold px-3 py-1 rounded-full">
            <Calendar size={12} />
            NEXT GAME
          </span>
          <span className="text-swarm-muted text-xs">
            {isHome ? '🏠 Home' : '✈️ Away'}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-swarm-blue/40 rounded-2xl flex items-center justify-center overflow-hidden">
              {swarmLogoUrl ? (
                <Image src={swarmLogoUrl} alt="Georgia Swarm" width={56} height={56} className="object-contain" />
              ) : (
                <span className="text-swarm-gold font-bold text-xl">GS</span>
              )}
            </div>
            <div>
              <div className="text-swarm-text font-bold text-lg">Georgia Swarm</div>
              <div className="text-swarm-muted text-xs">{isHome ? 'Home' : 'Away'}</div>
            </div>
          </div>

          <div className="text-swarm-gold font-bold text-xl">VS</div>

          <div className="flex items-center gap-3 flex-row-reverse">
            <TeamLogo teamCode={game.opponent_code} teamName={game.opponent} size={56} className="rounded-2xl" />
            <div className="text-right">
              <div className="text-swarm-text font-bold text-lg">{game.opponent}</div>
              <div className="text-swarm-muted text-xs">{isHome ? 'Away' : 'Home'}</div>
            </div>
          </div>
        </div>

        {/* Game info */}
        <div className="flex items-center gap-4 mb-5 text-sm text-swarm-muted">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {gameDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          {game.time && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {game.time}
            </span>
          )}
          {game.venue && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {game.venue}
            </span>
          )}
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 mb-5">
          <CountdownUnit value={timeLeft.days} label="days" />
          <span className="text-swarm-muted text-xl font-bold">:</span>
          <CountdownUnit value={timeLeft.hours} label="hrs" />
          <span className="text-swarm-muted text-xl font-bold">:</span>
          <CountdownUnit value={timeLeft.minutes} label="min" />
          <span className="text-swarm-muted text-xl font-bold">:</span>
          <CountdownUnit value={timeLeft.seconds} label="sec" />
        </div>

        {/* CTA */}
        <a
          href="https://georgiaswarm.com/tickets"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-swarm-gold text-swarm-navy font-bold px-5 py-2.5 rounded-xl hover:bg-swarm-gold-dim transition-colors text-sm"
        >
          <Ticket size={16} />
          Buy Tickets
        </a>
      </div>
    </div>
  );
}
