import { useEffect, useState } from 'react';
import { listKnownPlayers } from '../storage/playersRepository';
import { knownPlayerKey } from '../storage/db';
import type { KnownPlayer } from '../storage/types';

// Players remembered from earlier games, loaded once per mount.
export function useKnownPlayers() {
  const [players, setPlayers] = useState<KnownPlayer[]>([]);

  useEffect(() => {
    let cancelled = false;
    listKnownPlayers().then((p) => {
      if (!cancelled) setPlayers(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const find = (name: string) => players.find((p) => p.key === knownPlayerKey(name));
  return { players, find };
}
