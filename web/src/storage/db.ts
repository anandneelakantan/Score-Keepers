import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { GameRecord } from './types';

interface ScoreKeepersDB extends DBSchema {
  games: {
    key: string;
    value: GameRecord;
    indexes: { updatedAt: number };
  };
}

const DB_NAME = 'scorekeepers';
const DB_VERSION = 1;
export const GAMES_STORE = 'games';

let dbPromise: Promise<IDBPDatabase<ScoreKeepersDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<ScoreKeepersDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ScoreKeepersDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(GAMES_STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      },
    });
  }
  return dbPromise;
}
