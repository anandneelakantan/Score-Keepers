import type { CSSProperties } from 'react';
import type { LeaderboardRowData } from '../../hooks/useLeaderboard';
import { PlayerAvatar } from '../PlayerAvatar';
import { getPlayerColor } from '../../utils/playerColor';

const MEDALS = ['🥇', '🥈', '🥉'];

interface LeaderboardRowProps {
  row: LeaderboardRowData;
  recentScores: number[];
  leaderTotal: number;
}

export function LeaderboardRow({ row, recentScores, leaderTotal }: LeaderboardRowProps) {
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
  const isNegative = total < 0;
  const cleanTotal = Math.round(Math.abs(total) * 1e8) / 1e8;
  const [scoreInt, scoreDec] = String(cleanTotal).split('.');
  const pct = leaderTotal > 0 ? Math.max(4, Math.min(100, (Math.max(0, total) / leaderTotal) * 100)) : 0;

  return (
    <div className={`lb-row rank-${rankClass}`} style={{ animationDelay: `${(rank - 1) * 50}ms` }}>
      <div className="lb-rank-cell">
        <div className="lb-rank">{rank}</div>
      </div>
      {moveNode}
      <PlayerAvatar name={player.name} colorKey={player.id} emoji={player.emoji} size={40} />
      <div className="lb-name">
        <div className="lb-name-info">
          <span className="lb-name-text">{player.name}</span>
          {rank <= 3 && <span className="lb-medal">{MEDALS[rank - 1]}</span>}
          {wins > 0 && (
            <div className="lb-round-wins">
              🏅 {wins} round win{wins > 1 ? 's' : ''}
            </div>
          )}
          {recentScores.length > 0 && (
            <div className="lb-chips">
              {recentScores.map((s, i) => (
                <span className="lb-chip" key={i}>
                  {s >= 0 ? `+${s}` : s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="lb-progress-track">
        <div
          className="lb-progress-fill"
          style={{ width: `${pct}%`, '--pa-color': getPlayerColor(player.id) } as CSSProperties}
        />
      </div>
      <div className="lb-score">
        <span className="lb-score-num">
          {isNegative && <span className="lb-score-sign">-</span>}
          <span className="lb-score-int">{scoreInt}</span>
        </span>
        <span className="lb-score-dec">{scoreDec ? `.${scoreDec}` : ''}</span>
      </div>
    </div>
  );
}
