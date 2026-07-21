import type { LeaderboardRowData } from '../../hooks/useLeaderboard';
import { PlayerAvatar } from '../PlayerAvatar';

const MEDALS = ['🥇', '🥈', '🥉'];

export function LeaderboardRow({ row }: { row: LeaderboardRowData }) {
  const { player, rank, prevRank, total, wins } = row;

  let moveNode;
  if (prevRank === null) {
    moveNode = (
      <span className="lb-move move-new">
        <span className="move-icon">★</span> NEW
      </span>
    );
  } else {
    const diff = prevRank - rank;
    if (diff > 0) {
      moveNode = (
        <span className="lb-move move-up">
          <span className="move-icon">▲</span> +{diff}
        </span>
      );
    } else if (diff < 0) {
      moveNode = (
        <span className="lb-move move-down">
          <span className="move-icon">▼</span> {diff}
        </span>
      );
    } else {
      moveNode = (
        <span className="lb-move move-same">
          <span className="move-icon">—</span>
        </span>
      );
    }
  }

  const rankClass = rank <= 3 ? String(rank) : 'other';
  const scoreStr = total >= 0 ? `+${total}` : `${total}`;

  return (
    <tr className={`lb-row rank-${rankClass}`} style={{ animationDelay: `${(rank - 1) * 50}ms` }}>
      <td className="lb-rank-cell">
        <div className="lb-rank">{rank}</div>
      </td>
      <td>{moveNode}</td>
      <td>
        <div className="lb-name">
          <PlayerAvatar name={player.name} colorKey={player.id} size={24} />
          <span className="lb-name-text">{player.name}</span>
          {rank <= 3 && <span className="lb-medal">{MEDALS[rank - 1]}</span>}
        </div>
        {wins > 0 && (
          <div className="lb-round-wins">
            🏅 {wins} round win{wins > 1 ? 's' : ''}
          </div>
        )}
      </td>
      <td className="lb-score">{scoreStr}</td>
    </tr>
  );
}
