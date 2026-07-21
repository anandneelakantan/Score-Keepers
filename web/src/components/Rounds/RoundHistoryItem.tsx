import type { Player, Round } from '../../storage/types';
import { ScoreChip } from './ScoreChip';

interface RoundHistoryItemProps {
  round: Round;
  roundNum: number;
  players: Player[];
}

export function RoundHistoryItem({ round, roundNum, players }: RoundHistoryItemProps) {
  const nameById = new Map(players.map((p) => [p.id, p.name]));
  const winnerName = round.winnerId ? nameById.get(round.winnerId) : undefined;

  return (
    <div className="round-entry">
      <span className="round-entry-num">RD {roundNum}</span>
      <div className="round-scores-chips">
        {Object.entries(round.scores).map(([playerId, score]) => (
          <ScoreChip
            key={playerId}
            playerId={playerId}
            name={nameById.get(playerId) || '?'}
            score={score}
          />
        ))}
      </div>
      {winnerName && <span className="round-winner-badge">🏅 {winnerName}</span>}
    </div>
  );
}
