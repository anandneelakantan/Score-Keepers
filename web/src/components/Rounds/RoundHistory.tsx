import type { Player, Round } from '../../storage/types';
import { RoundHistoryItem } from './RoundHistoryItem';

interface RoundHistoryProps {
  rounds: Round[];
  players: Player[];
}

export function RoundHistory({ rounds, players }: RoundHistoryProps) {
  if (!rounds.length) {
    return (
      <div className="rounds-list">
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>No rounds yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounds-list">
      {[...rounds].reverse().map((r, ri) => (
        <RoundHistoryItem
          key={rounds.length - ri}
          round={r}
          roundNum={rounds.length - ri}
          players={players}
        />
      ))}
    </div>
  );
}
