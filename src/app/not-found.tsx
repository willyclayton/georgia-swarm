import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 bg-swarm-gold/10 border border-swarm-gold/20 rounded-full flex items-center justify-center mb-6">
        <span className="text-swarm-gold text-3xl font-bold">?</span>
      </div>
      <h1 className="text-swarm-text text-3xl font-bold mb-2">404</h1>
      <p className="text-swarm-muted mb-6 max-w-xs">
        This page went out of bounds. Even the Swarm can&apos;t find it.
      </p>
      <Link
        href="/"
        className="bg-swarm-gold text-swarm-navy font-bold px-6 py-3 rounded-xl hover:bg-swarm-gold-dim transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
