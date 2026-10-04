import { getDb, knownPlayerKey, PLAYERS_STORE } from './db';
import type { KnownPlayer } from './types';

// Most recently used first.
export async function listKnownPlayers(): Promise<KnownPlayer[]> {
  const db = await getDb();
  const players = await db.getAllFromIndex(PLAYERS_STORE, 'lastUsed');
  return players.reverse();
}

// The latest spelling of a name wins, and an emoji is kept unless replaced.
export async function rememberPlayers(players: { name: string; emoji?: string }[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(PLAYERS_STORE, 'readwrite');
  const now = Date.now();
  await Promise.all(
    players.map(async ({ name, emoji }) => {
      const key = knownPlayerKey(name);
      if (!key) return;
      const existing = await tx.store.get(key);
      await tx.store.put({ key, name: name.trim(), emoji: emoji ?? existing?.emoji, lastUsed: now });
    }),
  );
  await tx.done;
}
