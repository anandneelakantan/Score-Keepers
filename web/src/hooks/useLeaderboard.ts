import { useMemo } from 'react';
import type { Player, Round } from '../storage/types';
import { getCumulativeScores, getRankingAfterRound } from '../utils/ranking';

export interface LeaderboardRowData {
  player: Player;
  rank: number;
  prevRank: number | null;
  total: number;
  wins: number;
}

export function useLeaderboard(players: Player[], rounds: Round[], rankDir: 'high' | 'low') {
  return useMemo(() => {
    if (!players.length || !rounds.length) {
      return { rows: [] as LeaderboardRowData[] };
    }

    const { totals, wins } = getCumulativeScores(players, rounds);
    const currentRanks = getRankingAfterRound(players, rounds, rounds.length, rankDir);
    const prevRanks = rounds.length > 1
      ? getRankingAfterRound(players, rounds, rounds.length - 1, rankDir)
      : null;

    const sorted = [...players].sort((a, b) => currentRanks[a.id] - currentRanks[b.id]);
    const rows: LeaderboardRowData[] = sorted.map((p) => ({
      player: p,
      rank: currentRanks[p.id],
      prevRank: prevRanks ? prevRanks[p.id] : null,
      total: totals[p.id],
      wins: wins[p.id] || 0,
    }));

    return { rows };
  }, [players, rounds, rankDir]);
}
