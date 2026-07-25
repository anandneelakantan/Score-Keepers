import { useToast } from '../../context/ToastContext';
import type { GameRecord, GameSettings } from '../../storage/types';
import { PlayerInputList, type PlayerDraft } from './PlayerInputList';

const TIMER_PRESETS = [30, 60, 90, 120];

interface PlayerSetupProps {
  game: GameRecord;
  onChangeName: (name: string) => void;
  onChangeRankDir: (dir: GameSettings['rankDir']) => void;
  onChangeTrackWinner: (enabled: boolean) => void;
  onChangeTimerEnabled: (enabled: boolean) => void;
  onChangeTimerSeconds: (seconds: number) => void;
  onApplyPlayers: (players: PlayerDraft[]) => void;
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

  const handleApply = (players: PlayerDraft[]) => {
    if (players.length < 2) {
      notify('Add at least 2 players.');
      return;
    }
    const unique = new Set(players.map((p) => p.name.toLowerCase()));
    if (unique.size !== players.length) {
      notify('Player names must be unique.');
      return;
    }
    onApplyPlayers(players);
    notify(`✓ ${players.length} players set. Rounds reset.`);
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

      <PlayerInputList
        key={game.id}
        initialPlayers={game.players.map((p) => ({ name: p.name, emoji: p.emoji }))}
        onApply={handleApply}
      />
    </div>
  );
}
