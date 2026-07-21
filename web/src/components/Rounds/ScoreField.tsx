import { PlayerAvatar } from '../PlayerAvatar';

interface ScoreFieldProps {
  playerId: string;
  name: string;
  value: string;
  active: boolean;
  onActivate: () => void;
}

export function ScoreField({ playerId, name, value, active, onActivate }: ScoreFieldProps) {
  return (
    <div className="score-field">
      <div className="score-field-name" title={name}>
        <PlayerAvatar name={name} colorKey={playerId} size={20} />
        <span>{name}</span>
      </div>
      <input
        className={`score-input${active ? ' score-input-active' : ''}`}
        type="text"
        inputMode="none"
        readOnly
        value={value}
        onFocus={onActivate}
        onClick={onActivate}
      />
    </div>
  );
}
