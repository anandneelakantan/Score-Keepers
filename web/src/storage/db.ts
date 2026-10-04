import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase, IDBPTransaction, StoreNames } from 'idb';
import type { AppSettings, GameRecord, KnownPlayer } from './types';

interface ScoreKeepersDB extends DBSchema {
  games: {
    key: string;
    value: GameRecord;
    indexes: { updatedAt: number };
  };
  players: {
    key: string;
    value: KnownPlayer;
    indexes: { lastUsed: number };
  };
  settings: {
    key: keyof AppSettings;
    value: AppSettings[keyof AppSettings];
  };
}

const DB_NAME = 'scorekeepers';
const DB_VERSION = 2;
export const GAMES_STORE = 'games';
export const PLAYERS_STORE = 'players';
export const SETTINGS_STORE = 'settings';

// Keys that held app data in localStorage before everything moved into IndexedDB.
const LEGACY_THEME_KEY = 'sb-theme';
const LEGACY_MIGRATED_KEY = 'sb-migrated-v1';

export function knownPlayerKey(name: string): string {
  return name.trim().toLowerCase();
}

let dbPromise: Promise<IDBPDatabase<ScoreKeepersDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<ScoreKeepersDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ScoreKeepersDB>(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, _newVersion, tx) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(GAMES_STORE, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }
        if (oldVersion < 2) {
          db.createObjectStore(PLAYERS_STORE, { keyPath: 'key' }).createIndex('lastUsed', 'lastUsed');
          db.createObjectStore(SETTINGS_STORE);
          await moveLocalStorageSettings(tx);
          await seedPlayersFromGames(tx);
        }
      },
      // Step aside when another connection deletes or upgrades the database (e.g. a newer tab); reopen on next use.
      blocking() {
        dbPromise?.then((db) => db.close());
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

type UpgradeTx = IDBPTransaction<ScoreKeepersDB, StoreNames<ScoreKeepersDB>[], 'versionchange'>;

async function moveLocalStorageSettings(tx: UpgradeTx) {
  const settings = tx.objectStore(SETTINGS_STORE);
  try {
    const theme = localStorage.getItem(LEGACY_THEME_KEY);
    if (theme === 'dark' || theme === 'light' || theme === 'auto') await settings.put(theme, 'theme');
    if (localStorage.getItem(LEGACY_MIGRATED_KEY)) await settings.put(true, 'legacyMigrated');
    localStorage.removeItem(LEGACY_THEME_KEY);
    localStorage.removeItem(LEGACY_MIGRATED_KEY);
  } catch {
    // localStorage unavailable
  }
}

// Remember everyone from games saved before the players store existed.
async function seedPlayersFromGames(tx: UpgradeTx) {
  const games = await tx.objectStore(GAMES_STORE).getAll();
  const byKey = new Map<string, KnownPlayer>();
  // Oldest first so players from recent games end up most recent.
  for (const game of games.sort((a, b) => a.updatedAt - b.updatedAt)) {
    for (const { name, emoji } of game.players) {
      const key = knownPlayerKey(name);
      if (!key) continue;
      byKey.set(key, { key, name: name.trim(), emoji: emoji ?? byKey.get(key)?.emoji, lastUsed: game.updatedAt });
    }
  }
  const players = tx.objectStore(PLAYERS_STORE);
  await Promise.all([...byKey.values()].map((p) => players.put(p)));
}
