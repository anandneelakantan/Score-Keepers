import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import type { GameRecord, GameSettings } from '../../storage/types';
import { PlayerEditList } from './PlayerEditList';
import { PlayerInputList } from './PlayerInputList';
import { validatePlayerName, type PlayerDraft } from './playerNames';

const TIMER_PRESETS = [30, 60, 90, 120];

interface PlayerSetupProps {
  game: GameRecord;
  onChangeName: (name: string) => void;
  onChangeRankDir: (dir: GameSettings['rankDir']) => void;
  onChangeTrackWinner: (enabled: boolean) => void;
  onChangeTimerEnabled: (enabled: boolean) => void;
  onChangeTimerSeconds: (seconds: number) => void;
  onChangeWinningPoints: (points: number | undefined) => void;
  onStartGame: (players: PlayerDraft[]) => void;
  onRenamePlayer: (id: string, name: string) => void;
  onSetPlayerEmoji: (id: string, emoji: string | undefined) => void;
  onAddPlayer: (player: PlayerDraft) => void;
}

export function PlayerSetup({
  game,
  onChangeName,
  onChangeRankDir,
  onChangeTrackWinner,
  onChangeTimerEnabled,
  onChangeTimerSeconds,
  onChangeWinningPoints,
  onStartGame,
  onRenamePlayer,
  onSetPlayerEmoji,
  onAddPlayer,
}: PlayerSetupProps) {
  const { notify } = useToast();
  const inProgress = game.players.length > 0;
  const [drafts, setDrafts] = useState<PlayerDraft[]>([{ name: '' }]);

  const handleStart = () => {
    const players = drafts
      .map((d) => ({ name: d.name.trim(), emoji: d.emoji }))
      .filter((d) => d.name);
    if (players.length < 2) {
      notify('Add at least 2 players.');
      return;
    }
    const error = players
      .map((p, i) => validatePlayerName(p.name, players.slice(0, i).map((q) => q.name)))
      .find(Boolean);
    if (error) {
      notify(error);
      return;
    }
    onStartGame(players);
    notify(`✓ Game started with ${players.length} players.`);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">Game name</div>
        <div className="settings-row">
          <input
            className="player-input"
            type="text"
            placeholder="Enter game name"
            maxLength={40}
            value={game.name}
            onChange={(e) => onChangeName(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Ranking Order</div>
        <div className="settings-row">
          <span className="setting-label">Sort by points</span>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn${game.settings.rankDir === 'high' ? ' active' : ''}`}
              onClick={() => onChangeRankDir('high')}
            >
              ▲ Highest first
            </button>
            <button
              type="button"
              className={`toggle-btn${game.settings.rankDir === 'low' ? ' active' : ''}`}
              onClick={() => onChangeRankDir('low')}
            >
              ▼ Lowest first
            </button>
          </div>
        </div>
      </div>

      {game.settings.rankDir === 'high' && (
        <div className="card">
          <div className="card-title">Winning points</div>
          <div className="settings-row">
            <span className="setting-label">Target total</span>
            <input
              className="player-input winning-points-input"
              type="number"
              inputMode="numeric"
              placeholder="None"
              aria-label="Winning points"
              value={game.settings.winningPoints ?? ''}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value, 10);
                onChangeWinningPoints(Number.isNaN(value) ? undefined : value);
              }}
            />
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Round winner</div>
        <div className="settings-row">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={game.settings.trackWinner}
              onChange={(e) => onChangeTrackWinner(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            Track round winner
          </label>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Round timer</div>
        <div className="settings-row" style={{ marginBottom: game.settings.timer.enabled ? 14 : 0 }}>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={game.settings.timer.enabled}
              onChange={(e) => onChangeTimerEnabled(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            Time each round <span style={{ color: 'var(--muted)', fontWeight: 400 }}>— buzzer opens scoring</span>
          </label>
        </div>
        {game.settings.timer.enabled && (
          <div className="settings-row">
            <span className="setting-label">Length</span>
            <div className="toggle-group">
              {TIMER_PRESETS.map((secs) => (
                <button
                  key={secs}
                  type="button"
                  className={`toggle-btn${game.settings.timer.seconds === secs ? ' active' : ''}`}
                  onClick={() => onChangeTimerSeconds(secs)}
                >
                  {secs >= 120 && secs % 60 === 0 ? `${secs / 60}m` : `${secs}s`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {inProgress ? (
        <PlayerEditList
          players={game.players}
          onRename={onRenamePlayer}
          onSetEmoji={onSetPlayerEmoji}
          onAdd={onAddPlayer}
        />
      ) : (
        <>
          <PlayerInputList drafts={drafts} onChange={setDrafts} />
          <button type="button" className="btn btn-primary" onClick={handleStart}>
            Start game →
          </button>
        </>
      )}
    </div>
  );
}
