'use client';
import Image from 'next/image';
import { useState } from 'react';

const TEAM_COLORS: Record<string, string> = {
  GEO: '#1d4fbd',
  BUF: '#00438c',
  PHI: '#003da5',
  ALB: '#00447c',
  NE:  '#003b79',
  NYR: '#002868',
  ROC: '#4a0082',
  SAR: '#00843d',
  SAS: '#00366b',
  CGY: '#c8102e',
  VAN: '#00205b',
  COL: '#002868',
  HAL: '#003c71',
  CAR: '#005eb8',
};

type Props = {
  teamCode: string;
  teamName?: string;
  size?: number;
  className?: string;
};

export function TeamLogo({ teamCode, teamName, size = 40, className = '' }: Props) {
  const code = teamCode?.toUpperCase() ?? '';
  const color = TEAM_COLORS[code] ?? '#4b5563';
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center ${className}`}
      style={{ width: size, height: size, backgroundColor: error ? color : undefined }}
    >
      {error ? (
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: size * 0.35 }}>
          {code.slice(0, 3)}
        </span>
      ) : (
        <Image
          src={`/logos/${code}.png`}
          alt={teamName ?? teamCode}
          width={size}
          height={size}
          className="object-contain"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
