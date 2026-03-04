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
      <span className="font-display font-black text-3xl text-swarm-gold tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-swarm-muted text-[10px] uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

type Props = { game: Game };

export function NextGameHero({ game }: Props) {
  const timeLeft = useCountdown(game.date);
  const gameDate = new Date(game.date);
  const isHome = game.is_home;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-swarm-card border border-swarm-border">
      {/* Gold top accent bar */}
      <div className="h-1.5 bg-swarm-gold w-full" />

      <div className="p-6">
        {/* Label */}
        <div className="flex items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 bg-swarm-gold/20 text-swarm-gold text-xs font-semibold px-3 py-1 rounded-full">
            <Calendar size={12} />
            NEXT GAME
          </span>
          <span className="text-swarm-muted text-xs">
            {isHome ? '🏠 Home' : '✈️ Away'}
          </span>
        </div>

        {/* 3-column matchup */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-5">
          {/* Swarm */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-swarm-blue/20 rounded-2xl flex items-center justify-center overflow-hidden">
              {swarmLogoUrl ? (
                <Image src={swarmLogoUrl} alt="Georgia Swarm" width={64} height={64} className="object-contain" />
              ) : (
                <span className="text-swarm-gold font-bold text-xl">GS</span>
              )}
            </div>
            <span className="font-display font-bold text-sm text-swarm-text text-center leading-tight">Georgia Swarm</span>
          </div>

          {/* VS + date */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-display font-black text-2xl text-swarm-gold">VS</span>
            <span className="text-swarm-muted text-[10px] text-center leading-tight">
              {gameDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            {game.time && (
              <span className="text-swarm-muted text-[10px]">{game.time}</span>
            )}
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 flex items-center justify-center">
              <TeamLogo teamCode={game.opponent_code} teamName={game.opponent} size={64} className="rounded-2xl" />
            </div>
            <span className="font-display font-bold text-sm text-swarm-text text-center leading-tight">{game.opponent}</span>
          </div>
        </div>

        {/* Venue */}
        {game.venue && (
          <div className="flex items-center gap-1.5 text-swarm-muted text-xs mb-5">
            <MapPin size={12} />
            {game.venue}
          </div>
        )}

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
          className="inline-flex items-center gap-2 bg-swarm-gold text-swarm-navy font-display font-bold px-6 py-2.5 rounded-full hover:bg-swarm-gold-dim transition-colors text-sm uppercase tracking-wide"
        >
          <Ticket size={16} />
          Buy Tickets
        </a>
      </div>
    </div>
  );
}
