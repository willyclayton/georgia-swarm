import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const TEAM_ID = 539;
    const SEASON_ID = 225;
    const url = `https://nllstatsapp.aordev.com/?data_type=schedule&mode=rest_of_season&phase=REG&season_id=${SEASON_ID}&team_id=${TEAM_ID}`;

    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return NextResponse.json({ live: false });

    const data = await res.json();
    const games = data?.data?.schedule ?? data?.schedule ?? [];

    const today = new Date().toISOString().split('T')[0];
    const liveGame = games.find((g: { date?: string; status?: string }) => {
      const gameDate = (g.date ?? '').split('T')[0];
      return gameDate === today && g.status === 'live';
    });

    if (!liveGame) return NextResponse.json({ live: false });

    return NextResponse.json({ live: true, game: liveGame });
  } catch {
    return NextResponse.json({ live: false });
  }
}
