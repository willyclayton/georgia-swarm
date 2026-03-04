'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
        <span className="text-red-400 text-3xl font-bold">!</span>
      </div>
      <h1 className="text-swarm-text text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-swarm-muted mb-6 max-w-xs">
        The Swarm hit a snag. Try refreshing or come back later.
      </p>
      <button
        onClick={reset}
        className="bg-swarm-gold text-swarm-navy font-bold px-6 py-3 rounded-xl hover:bg-swarm-gold-dim transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
