import Image from 'next/image';
import { TeamLogo } from '@/components/ui/TeamLogo';
import type { Game } from '@/lib/data';
import Link from 'next/link';
import logoMapData from '@/data/team-logos.json';

const swarmLogoUrl = (logoMapData as Record<string, string>)['GEO'] ?? '';

type Props = { game: Game };

export function RecentResult({ game }: Props) {
  const swarmScore = game.is_home ? game.home_score! : game.away_score!;
  const oppScore = game.is_home ? game.away_score! : game.home_score!;
  const win = swarmScore > oppScore;

  const top = game.top_performers?.[0];

  return (
    <div className="bg-swarm-card rounded-2xl p-4 border border-swarm-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-swarm-muted text-xs font-medium uppercase tracking-wider">Last Game</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${win ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {win ? 'W' : 'L'}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-swarm-blue/40 rounded-full flex items-center justify-center overflow-hidden">
            {swarmLogoUrl ? (
              <Image src={swarmLogoUrl} alt="Georgia Swarm" width={32} height={32} className="object-contain" />
            ) : (
              <span className="text-swarm-gold font-bold text-xs">GS</span>
            )}
          </div>
          <span className="text-swarm-text font-medium text-sm">Georgia Swarm</span>
        </div>
        <span className="text-swarm-text font-bold tabular-nums">{swarmScore}</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TeamLogo teamCode={game.opponent_code} teamName={game.opponent} size={32} />
          <span className="text-swarm-text font-medium text-sm">{game.opponent}</span>
        </div>
        <span className="text-swarm-text font-bold tabular-nums">{oppScore}</span>
      </div>

      {top && (
        <div className="border-t border-swarm-border pt-3">
          <p className="text-swarm-muted text-xs">
            Top performer: <span className="text-swarm-text font-medium">{top.name}</span>
            {' '}<span className="text-swarm-gold">{top.value} {top.stat}</span>
          </p>
        </div>
      )}

      <Link
        href={`/schedule/${game.game_id}`}
        className="block mt-3 text-center text-swarm-blue-light text-xs hover:text-swarm-gold transition-colors"
      >
        View box score →
      </Link>
    </div>
  );
}
