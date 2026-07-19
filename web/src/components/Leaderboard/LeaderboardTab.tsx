import { useRef } from 'react';
import type { GameRecord } from '../../storage/types';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { LeaderboardRow } from './LeaderboardRow';
import { ExportImageButton } from '../ExportImageButton';

export function LeaderboardTab({ game }: { game: GameRecord }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const { rows } = useLeaderboard(game.players, game.rounds, game.settings.rankDir);

  const title = game.name.trim() || 'LEADERBOARD';
  const roundInfo = `${game.rounds.length} Round${game.rounds.length !== 1 ? 's' : ''} Played`;
  const headerSub = game.players.length
    ? `${game.players.length} Players · ${game.rounds.length} Rounds`
    : 'No players set';
  const roundsCountLabel = game.rounds.length
    ? `Ranked: ${game.settings.rankDir === 'high' ? '▲ Highest First' : '▼ Lowest First'}`
    : '';

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-left">
          <div
            className="round-badge"
            style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: 'var(--muted)' }}
          >
            {roundInfo}
          </div>
        </div>
        <ExportImageButton captureRef={captureRef} game={game} />
      </div>

      <div id="leaderboard-capture" ref={captureRef}>
        <div className="lb-header">
          <div>
            <div className="lb-title">{title}</div>
            <div className="lb-subtitle">{headerSub}</div>
          </div>
          <div className="lb-rounds-count">{roundsCountLabel}</div>
        </div>
        <div>
          {!game.players.length || !game.rounds.length ? (
            <div className="empty-state">
              <div className="icon">🏆</div>
              <p>Submit at least one round to see the leaderboard.</p>
            </div>
          ) : (
            <table className="lb-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Move</th>
                  <th>Player</th>
                  <th style={{ textAlign: 'right' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <LeaderboardRow key={row.player.id} row={row} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
