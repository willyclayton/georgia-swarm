'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Star, CheckCircle, Instagram, Twitter } from 'lucide-react';

// ── Player MVP Vote ───────────────────────────────────────────────────────────
const MVP_OPTIONS = [
  { id: 'lyle-thompson', name: 'Lyle Thompson', stat: '12 goals last game' },
  { id: 'randy-staats', name: 'Randy Staats', stat: '3 goals, 4 assists' },
  { id: 'dillon-ward', name: 'Dillon Ward', stat: '42 saves (92%)' },
];

function PlayerVote() {
  const [voted, setVoted] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('swarm-mvp-vote');
      if (saved) {
        const { choice, counts } = JSON.parse(saved);
        setVoted(choice);
        setVotes(counts);
      } else {
        const initial: Record<string, number> = {};
        MVP_OPTIONS.forEach((o) => (initial[o.id] = Math.floor(Math.random() * 80) + 20));
        setVotes(initial);
      }
    } catch { /* ignore */ }
  }, []);

  const handleVote = (id: string) => {
    if (voted) return;
    const newVotes = { ...votes, [id]: (votes[id] ?? 0) + 1 };
    setVotes(newVotes);
    setVoted(id);
    try {
      localStorage.setItem('swarm-mvp-vote', JSON.stringify({ choice: id, counts: newVotes }));
    } catch { /* ignore */ }
  };

  const total = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-swarm-card rounded-2xl p-5 border border-swarm-border">
      <div className="flex items-center gap-2 mb-4">
        <Star className="text-swarm-gold" size={18} />
        <h2 className="text-swarm-text font-semibold">Game MVP Vote</h2>
      </div>
      <p className="text-swarm-muted text-sm mb-4">Who was the Swarm MVP last game?</p>
      <div className="space-y-3">
        {MVP_OPTIONS.map((opt) => {
          const pct = total > 0 ? Math.round(((votes[opt.id] ?? 0) / total) * 100) : 0;
          const isChosen = voted === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={!!voted}
              className={`relative w-full text-left rounded-xl border p-3 overflow-hidden transition-all ${
                isChosen
                  ? 'border-swarm-gold bg-swarm-gold/10'
                  : voted
                  ? 'border-swarm-border opacity-70 cursor-default'
                  : 'border-swarm-border hover:border-swarm-blue/50 cursor-pointer'
              }`}
            >
              {voted && (
                <div
                  className="absolute inset-0 bg-swarm-blue/15 origin-left transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <div>
                  <p className={`font-medium text-sm ${isChosen ? 'text-swarm-gold' : 'text-swarm-text'}`}>
                    {opt.name}
                  </p>
                  <p className="text-swarm-muted text-xs">{opt.stat}</p>
                </div>
                {voted && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-swarm-text font-bold text-sm tabular-nums">{pct}%</span>
                    {isChosen && <CheckCircle size={16} className="text-swarm-gold" />}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {voted && (
        <p className="text-swarm-muted text-xs text-center mt-3">
          {total} fans voted
        </p>
      )}
    </div>
  );
}

// ── Trivia ────────────────────────────────────────────────────────────────────
const TRIVIA_QUESTIONS = [
  {
    q: 'What year was the Georgia Swarm founded?',
    options: ['2015', '2017', '2019', '2021'],
    answer: 1,
  },
  {
    q: 'What league does the Georgia Swarm play in?',
    options: ['MLL', 'PLL', 'NLL', 'AUDL'],
    answer: 2,
  },
  {
    q: "What are the Georgia Swarm's official colors?",
    options: ['Red & Black', 'Navy & Gold', 'Green & White', 'Blue & Orange'],
    answer: 1,
  },
  {
    q: 'How many periods are in an NLL game?',
    options: ['2', '3', '4', '5'],
    answer: 2,
  },
  {
    q: 'The NLL plays primarily on what type of surface?',
    options: ['Grass', 'Artificial turf', 'Indoor hardwood', 'Concrete'],
    answer: 2,
  },
];

function TriviaWidget() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const q = TRIVIA_QUESTIONS[current];

  const handleAnswer = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current < TRIVIA_QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setRevealed(false);
    setDone(false);
  };

  return (
    <div className="bg-swarm-card rounded-2xl p-5 border border-swarm-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-swarm-text font-semibold">Swarm Trivia</h2>
        <span className="text-swarm-muted text-xs">
          {done ? 'Complete!' : `${current + 1}/${TRIVIA_QUESTIONS.length}`}
        </span>
      </div>

      {done ? (
        <div className="text-center py-6">
          <p className="text-4xl font-bold text-swarm-gold mb-2">{score}/{TRIVIA_QUESTIONS.length}</p>
          <p className="text-swarm-text mb-1">
            {score === 5 ? '🏆 Perfect score!' : score >= 3 ? '🎯 Nice work!' : '📚 Keep learning!'}
          </p>
          <p className="text-swarm-muted text-sm mb-5">You know your Swarm!</p>
          <button
            onClick={reset}
            className="bg-swarm-gold text-swarm-navy font-bold px-5 py-2.5 rounded-xl hover:bg-swarm-gold-dim transition-colors text-sm"
          >
            Play Again
          </button>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="h-1 bg-swarm-surface rounded-full mb-4">
            <div
              className="h-full bg-swarm-gold rounded-full transition-all"
              style={{ width: `${((current) / TRIVIA_QUESTIONS.length) * 100}%` }}
            />
          </div>

          <p className="text-swarm-text font-medium mb-4">{q.q}</p>

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.answer;
              const isSelected = i === selected;
              let cls = 'border-swarm-border text-swarm-text';
              if (revealed) {
                if (isCorrect) cls = 'border-green-500 bg-green-500/15 text-green-400';
                else if (isSelected) cls = 'border-red-500 bg-red-500/15 text-red-400';
                else cls = 'border-swarm-border text-swarm-muted opacity-60';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={revealed}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${cls} ${
                    !revealed ? 'hover:border-swarm-blue/50 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {revealed && (
            <button
              onClick={handleNext}
              className="mt-4 w-full bg-swarm-gold text-swarm-navy font-bold py-2.5 rounded-xl hover:bg-swarm-gold-dim transition-colors text-sm"
            >
              {current < TRIVIA_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FanZonePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <PageHeader title="Fan Zone" subtitle="Vote, trivia & community" />
      <PlayerVote />
      <TriviaWidget />

      {/* Social links */}
      <div className="bg-swarm-card rounded-2xl p-5 border border-swarm-border">
        <h2 className="text-swarm-text font-semibold mb-4">Follow the Swarm</h2>
        <div className="flex gap-3">
          <a
            href="https://twitter.com/georgiaswarm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-swarm-surface rounded-xl px-4 py-3 text-swarm-text hover:bg-swarm-blue/20 transition-colors flex-1 justify-center"
          >
            <Twitter size={18} />
            <span className="text-sm font-medium">@georgiaswarm</span>
          </a>
          <a
            href="https://instagram.com/georgiaswarm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-swarm-surface rounded-xl px-4 py-3 text-swarm-text hover:bg-swarm-blue/20 transition-colors flex-1 justify-center"
          >
            <Instagram size={18} />
            <span className="text-sm font-medium">@georgiaswarm</span>
          </a>
        </div>
      </div>
    </div>
  );
}
