import type { CSSProperties } from 'react';
import type { Player, Round } from '../../storage/types';
import { PlayerAvatar } from '../PlayerAvatar';

interface RoundHistoryProps {
  rounds: Round[];
  players: Player[];
  onUndoRound: () => void;
}

export function RoundHistory({ rounds, players, onUndoRound }: RoundHistoryProps) {
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

  const gridStyle: CSSProperties = {
    gridTemplateColumns: `56px repeat(${players.length}, minmax(64px, 1fr))`,
  };

  const totals: Record<string, number> = {};
  players.forEach((p) => {
    totals[p.id] = 0;
  });
  rounds.forEach((r) => {
    players.forEach((p) => {
      totals[p.id] += r.scores[p.id] || 0;
    });
  });

  return (
    <>
      <div className="rounds-list">
        <div className="history-scroll">
          <div className="history-table">
            <div className="history-row history-head-row" style={gridStyle}>
              <div className="history-head-cell history-round-label">RND</div>
              {players.map((p) => (
                <div className="history-head-cell" key={p.id} title={p.name}>
                  <PlayerAvatar name={p.name} colorKey={p.id} emoji={p.emoji} size={22} />
                </div>
              ))}
            </div>

            {rounds.map((round, i) => {
              const roundNum = i + 1;
              return (
                <div className="history-row" style={gridStyle} key={roundNum}>
                  <div className="history-round-label">
                    RD {roundNum}
                    {round.winnerId && (
                      <span className="round-winner-badge">
                        🏅 {players.find((p) => p.id === round.winnerId)?.name}
                      </span>
                    )}
                  </div>
                  {players.map((p) => (
                    <div
                      className={`history-cell${round.winnerId === p.id ? ' history-cell-winner' : ''}`}
                      key={p.id}
                    >
                      {round.scores[p.id] ?? '—'}
                    </div>
                  ))}
                </div>
              );
            })}

            <div className="history-row history-totals-row" style={gridStyle}>
              <div className="history-totals-label">TOTAL</div>
              {players.map((p) => (
                <div className="history-total-cell" key={p.id}>
                  {totals[p.id]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="undo-callout">
        <div className="undo-callout-icon">↩️</div>
        <div className="undo-callout-text">
          <div className="undo-callout-title">Undo Round {rounds.length}</div>
          <div className="undo-callout-desc">Removes the last entries for everyone</div>
        </div>
        <button type="button" className="btn btn-danger" onClick={onUndoRound}>
          Undo Last Round
        </button>
      </div>
    </>
  );
}
