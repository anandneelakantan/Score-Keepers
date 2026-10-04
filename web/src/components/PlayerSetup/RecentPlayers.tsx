import { knownPlayerKey } from '../../storage/db';
import type { KnownPlayer } from '../../storage/types';
import { PlayerAvatar } from '../PlayerAvatar';

const MAX_RECENT = 6;

interface RecentPlayersProps {
  players: KnownPlayer[];
  exclude: string[];
  onPick: (player: KnownPlayer) => void;
}

// One-tap chips for the most recently used players not already in the game.
export function RecentPlayers({ players, exclude, onPick }: RecentPlayersProps) {
  const taken = new Set(exclude.map(knownPlayerKey));
  const options = players.filter((p) => !taken.has(p.key)).slice(0, MAX_RECENT);
  if (!options.length) return null;

  return (
    <div className="setup-recent">
      <span className="setup-label">Recent</span>
      {options.map((p) => (
        <button key={p.key} type="button" className="setup-chip" onClick={() => onPick(p)}>
          <PlayerAvatar name={p.name} emoji={p.emoji} size={22} />
          {p.name}
        </button>
      ))}
    </div>
  );
}
