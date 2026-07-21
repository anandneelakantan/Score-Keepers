import type { Player } from '../../storage/types';
import { PlayerAvatar } from '../PlayerAvatar';

interface WinnerSelectProps {
  players: Player[];
  value: string;
  onChange: (playerId: string) => void;
}

export function WinnerSelect({ players, value, onChange }: WinnerSelectProps) {
  return (
    <div className="winner-row">
      <span className="winner-label">🏅 Round Winner (optional)</span>
      <div className="winner-picker" role="radiogroup" aria-label="Round winner">
        <button
          type="button"
          className={`winner-option winner-option-none${value === '' ? ' active' : ''}`}
          aria-pressed={value === ''}
          onClick={() => onChange('')}
        >
          No winner
        </button>
        {players.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`winner-option${value === p.id ? ' active' : ''}`}
            aria-pressed={value === p.id}
            onClick={() => onChange(p.id)}
          >
            <PlayerAvatar name={p.name} colorKey={p.id} size={20} />
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
