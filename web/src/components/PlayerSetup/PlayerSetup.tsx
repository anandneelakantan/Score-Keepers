import { useToast } from '../../context/ToastContext';
import type { GameRecord, GameSettings } from '../../storage/types';
import { PlayerInputList } from './PlayerInputList';

interface PlayerSetupProps {
  game: GameRecord;
  onChangeName: (name: string) => void;
  onChangeRankDir: (dir: GameSettings['rankDir']) => void;
  onChangeTrackWinner: (enabled: boolean) => void;
  onApplyPlayers: (names: string[]) => void;
}

export function PlayerSetup({
  game,
  onChangeName,
  onChangeRankDir,
  onChangeTrackWinner,
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

      <PlayerInputList
        key={game.id}
        initialNames={game.players.map((p) => p.name)}
        onApply={handleApply}
      />
    </div>
  );
}
