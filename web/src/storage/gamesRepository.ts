import { getDb, GAMES_STORE } from './db';
import type { GameRecord } from './types';

// Records saved before the timer setting was introduced won't have it in IndexedDB.
function normalizeGame(game: GameRecord): GameRecord {
  if (game.settings.timer) return game;
  return { ...game, settings: { ...game.settings, timer: { enabled: false, seconds: 30 } } };
}

export async function listGames(): Promise<GameRecord[]> {
  const db = await getDb();
  const games = await db.getAllFromIndex(GAMES_STORE, 'updatedAt');
  return games.reverse().map(normalizeGame); // most recently updated first
}

export async function getGame(id: string): Promise<GameRecord | undefined> {
  const db = await getDb();
  const game = await db.get(GAMES_STORE, id);
  return game ? normalizeGame(game) : undefined;
}

export async function createGame(name: string): Promise<GameRecord> {
  const now = Date.now();
  const game: GameRecord = {
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled Game',
    createdAt: now,
    updatedAt: now,
    players: [],
    rounds: [],
    settings: { rankDir: 'high', trackWinner: true, timer: { enabled: false, seconds: 30 } },
  };
  const db = await getDb();
  await db.put(GAMES_STORE, game);
  return game;
}

export async function saveGame(game: GameRecord): Promise<void> {
  const db = await getDb();
  await db.put(GAMES_STORE, { ...game, updatedAt: Date.now() });
}

export async function deleteGame(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(GAMES_STORE, id);
}

export async function importGame(game: GameRecord): Promise<void> {
  const db = await getDb();
  await db.put(GAMES_STORE, game);
}
