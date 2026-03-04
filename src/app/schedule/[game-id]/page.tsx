import { getSchedule, getGameById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Calendar, MapPin } from 'lucide-react';

export const revalidate = 3600;

export async function generateStaticParams() {
  return getSchedule().map((g) => ({ 'game-id': g.game_id }));
}

type Props = { params: Promise<{ 'game-id': string }> };

export default async function GameDetailPage({ params }: Props) {
  const { 'game-id': gameId } = await params;
  const game = getGameById(gameId);
  if (!game) notFound();

  const swarmScore = game.is_home ? game.home_score : game.away_score;
  const oppScore = game.is_home ? game.away_score : game.home_score;
  const isFinal = game.status === 'final';
  const win = isFinal && swarmScore !== undefined && oppScore !== undefined && swarmScore > oppScore;

  const dateStr = new Date(game.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Score banner */}
      <div className="bg-gradient-to-br from-swarm-blue via-swarm-surface to-swarm-navy rounded-2xl p-6 border border-swarm-border">
        {/* Date / venue */}
        <div className="flex items-center gap-3 mb-4 text-swarm-muted text-xs">
          <span className="flex items-center gap-1"><Calendar size={12} /> {dateStr}</span>
          {game.venue && <span className="flex items-center gap-1"><MapPin size={12} /> {game.venue}</span>}
          {isFinal && (
            <span className={`ml-auto font-bold px-2 py-0.5 rounded-full text-xs ${win ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {win ? 'WIN' : 'LOSS'}
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="w-14 h-14 mx-auto bg-swarm-blue rounded-2xl flex items-center justify-center text-swarm-gold font-bold text-xl mb-1">
              GS
            </div>
            <p className="text-swarm-text font-medium text-sm">Georgia Swarm</p>
          </div>

          <div className="text-center px-4">
            {isFinal ? (
              <p className="text-swarm-gold text-4xl font-bold tabular-nums">
                {swarmScore} – {oppScore}
              </p>
            ) : (
              <p className="text-swarm-muted text-lg font-medium">
                {game.time ?? 'TBD'} ET
              </p>
            )}
            {isFinal && <p className="text-swarm-muted text-xs mt-1">Final</p>}
          </div>

          <div className="text-center flex-1">
            <TeamLogo teamCode={game.opponent_code} teamName={game.opponent} size={56} className="mx-auto mb-1 rounded-2xl" />
            <p className="text-swarm-text font-medium text-sm">{game.opponent}</p>
          </div>
        </div>
      </div>

      {/* Quarter scores */}
      {game.quarter_scores && game.quarter_scores.length > 0 && (
        <div className="bg-swarm-card rounded-2xl p-4 border border-swarm-border">
          <h2 className="text-swarm-muted text-xs font-medium uppercase tracking-wider mb-3">Quarter Scores</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead>
                <tr className="text-swarm-muted text-xs">
                  <th className="text-left pb-2">Team</th>
                  {game.quarter_scores.map((_, i) => (
                    <th key={i} className="pb-2">Q{i + 1}</th>
                  ))}
                  <th className="pb-2 font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-swarm-border">
                <tr>
                  <td className="py-2 text-left text-swarm-gold font-medium">Swarm</td>
                  {game.quarter_scores.map((q, i) => (
                    <td key={i} className="py-2 tabular-nums">{game.is_home ? q.home : q.away}</td>
                  ))}
                  <td className="py-2 tabular-nums font-bold text-swarm-text">{swarmScore}</td>
                </tr>
                <tr>
                  <td className="py-2 text-left text-swarm-text">{game.opponent}</td>
                  {game.quarter_scores.map((q, i) => (
                    <td key={i} className="py-2 tabular-nums">{game.is_home ? q.away : q.home}</td>
                  ))}
                  <td className="py-2 tabular-nums font-bold text-swarm-text">{oppScore}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top performers */}
      {game.top_performers && game.top_performers.length > 0 && (
        <div className="bg-swarm-card rounded-2xl p-4 border border-swarm-border">
          <h2 className="text-swarm-muted text-xs font-medium uppercase tracking-wider mb-3">Top Performers</h2>
          <div className="space-y-2">
            {game.top_performers.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-swarm-text text-sm font-medium">{p.name}</span>
                <span className="text-swarm-gold text-sm font-bold">{p.value} {p.stat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlight embed */}
      {game.highlight_video_id && (
        <div className="bg-swarm-card rounded-2xl overflow-hidden border border-swarm-border">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${game.highlight_video_id}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
