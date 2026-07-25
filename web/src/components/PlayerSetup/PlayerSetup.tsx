import { useToast } from '../../context/ToastContext';
import type { GameRecord, GameSettings } from '../../storage/types';
import { PlayerInputList } from './PlayerInputList';

const TIMER_PRESETS = [6, 30, 60];

interface PlayerSetupProps {
  game: GameRecord;
  onChangeName: (name: string) => void;
  onChangeRankDir: (dir: GameSettings['rankDir']) => void;
  onChangeTrackWinner: (enabled: boolean) => void;
  onChangeTimerEnabled: (enabled: boolean) => void;
  onChangeTimerSeconds: (seconds: number) => void;
  onApplyPlayers: (names: string[]) => void;
}

export function PlayerSetup({
  game,
  onChangeName,
  onChangeRankDir,
  onChangeTrackWinner,
  onChangeTimerEnabled,
  onChangeTimerSeconds,
  onApplyPlayers,
}: PlayerSetupProps) {
  const { notify } = useToast();

  const handleApply = (names: string[]) => {
    if (names.length < 2) {
      notify('Add at least 2 players.');
      return;
    }
    const unique = new Set(names.map((n) => n.toLowerCase()));
    if (unique.size !== names.length) {
      notify('Player names must be unique.');
      return;
    }
    onApplyPlayers(names);
    notify(`✓ ${names.length} players set. Rounds reset.`);
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
            Time each round (e.g. 6-second scribble)
          </label>
        </div>
        {game.settings.timer.enabled && (
          <div className="settings-row">
            <span className="setting-label">Duration</span>
            <div className="toggle-group">
              {TIMER_PRESETS.map((secs) => (
                <button
                  key={secs}
                  type="button"
                  className={`toggle-btn${game.settings.timer.seconds === secs ? ' active' : ''}`}
                  onClick={() => onChangeTimerSeconds(secs)}
                >
                  {secs}s
                </button>
              ))}
            </div>
            <input
              className="player-input"
              style={{ width: 90 }}
              type="number"
              min={1}
              max={3600}
              value={game.settings.timer.seconds}
              onChange={(e) => {
                const val = Math.max(1, Math.min(3600, parseInt(e.target.value, 10) || 1));
                onChangeTimerSeconds(val);
              }}
            />
          </div>
        )}
      </div>

      <PlayerInputList
        key={game.id}
        initialNames={game.players.map((p) => p.name)}
        onApply={handleApply}
      />
    </div>
  );
}
