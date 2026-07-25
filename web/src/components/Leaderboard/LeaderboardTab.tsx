import { useRef } from 'react';
import type { GameRecord } from '../../storage/types';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { LeaderboardRow } from './LeaderboardRow';
import { WormChart } from './WormChart';
import { ExportImageButton } from '../ExportImageButton';

const RECENT_ROUNDS = 4;

export function LeaderboardTab({ game }: { game: GameRecord }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const { rows } = useLeaderboard(game.players, game.rounds, game.settings.rankDir);
  const leaderTotal = rows.length ? Math.max(0, ...rows.map((r) => r.total)) : 0;

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
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--muted)', letterSpacing: 1 }}
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
        {game.players.length && game.rounds.length ? <WormChart game={game} /> : null}
        <div>
          {!game.players.length || !game.rounds.length ? (
            <div className="empty-state">
              <div className="icon">🏆</div>
              <p>Submit at least one round to see the leaderboard.</p>
            </div>
          ) : (
            <div className="lb-list">
              {rows.map((row) => (
                <LeaderboardRow
                  key={row.player.id}
                  row={row}
                  leaderTotal={leaderTotal}
                  recentScores={game.rounds
                    .slice(-RECENT_ROUNDS)
                    .map((r) => r.scores[row.player.id] ?? 0)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
