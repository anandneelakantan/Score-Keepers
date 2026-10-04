import { knownPlayerKey } from '../../storage/db';
import type { KnownPlayer } from '../../storage/types';

export const KNOWN_PLAYERS_LIST_ID = 'known-players';

interface KnownPlayerOptionsProps {
  players: KnownPlayer[];
  exclude: string[];
}

// Suggestions for player name inputs (via `list={KNOWN_PLAYERS_LIST_ID}`), minus names already taken.
export function KnownPlayerOptions({ players, exclude }: KnownPlayerOptionsProps) {
  const taken = new Set(exclude.map(knownPlayerKey));

  return (
    <datalist id={KNOWN_PLAYERS_LIST_ID}>
      {players
        .filter((p) => !taken.has(p.key))
        .map((p) => (
          <option key={p.key} value={p.name} />
        ))}
    </datalist>
  );
}
