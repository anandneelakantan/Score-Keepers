import type { Player } from '../../storage/types';

interface WinnerSelectProps {
  players: Player[];
  value: string;
  onChange: (playerId: string) => void;
}

export function WinnerSelect({ players, value, onChange }: WinnerSelectProps) {
  return (
    <div className="winner-row">
      <span className="winner-label">🏅 Round Winner (optional)</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— No winner selected —</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
