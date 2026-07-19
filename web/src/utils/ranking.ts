import type { Player, Round } from '../storage/types';

export function getCumulativeScores(players: Player[], rounds: Round[]) {
  const totals: Record<string, number> = {};
  const wins: Record<string, number> = {};
  players.forEach((p) => {
    totals[p.id] = 0;
    wins[p.id] = 0;
  });
  rounds.forEach((r) => {
    players.forEach((p) => {
      totals[p.id] += r.scores[p.id] || 0;
    });
    if (r.winnerId) wins[r.winnerId] = (wins[r.winnerId] || 0) + 1;
  });
  return { totals, wins };
}

export function getRankingAfterRound(
  players: Player[],
  rounds: Round[],
  upToRound: number,
  rankDir: 'high' | 'low',
): Record<string, number> {
  const totals: Record<string, number> = {};
  players.forEach((p) => {
    totals[p.id] = 0;
  });
  for (let i = 0; i < upToRound; i++) {
    const r = rounds[i];
    players.forEach((p) => {
      totals[p.id] += r.scores[p.id] || 0;
    });
  }
  const sorted = [...players].sort((a, b) =>
    rankDir === 'high' ? totals[b.id] - totals[a.id] : totals[a.id] - totals[b.id],
  );
  const rankMap: Record<string, number> = {};
  sorted.forEach((p, i) => {
    rankMap[p.id] = i + 1;
  });
  return rankMap;
}
