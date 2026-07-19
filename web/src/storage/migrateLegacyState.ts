import { importGame } from './gamesRepository';
import type { GameRecord, Round } from './types';

const MIGRATION_FLAG = 'sb-migrated-v1';
const LEGACY_STATE_KEY = 'sb-state';

interface LegacyRound {
  scores?: Record<string, number>;
  winner?: string;
}

interface LegacyState {
  rankDir?: 'high' | 'low';
  players?: string[];
  rounds?: LegacyRound[];
  gameName?: string;
  trackWinner?: boolean;
}

/**
 * One-time import of the pre-React single-blob localStorage state
 * (key `sb-state`) into the new multi-game IndexedDB store.
 * Returns the imported game's name, or null if there was nothing to import.
 */
export async function migrateLegacyStateIfNeeded(): Promise<string | null> {
  if (localStorage.getItem(MIGRATION_FLAG)) return null;

  try {
    const raw = localStorage.getItem(LEGACY_STATE_KEY);
    if (!raw) {
      localStorage.setItem(MIGRATION_FLAG, '1');
      return null;
    }

    const legacy: LegacyState = JSON.parse(raw);
    if (!legacy.players?.length) {
      localStorage.setItem(MIGRATION_FLAG, '1');
      return null;
    }

    const nameToId = new Map<string, string>();
    const players = legacy.players.map((name) => {
      const id = crypto.randomUUID();
      nameToId.set(name, id);
      return { id, name };
    });

    const rounds: Round[] = (legacy.rounds || []).map((r) => {
      const scores: Record<string, number> = {};
      Object.entries(r.scores || {}).forEach(([name, val]) => {
        const id = nameToId.get(name);
        if (id) scores[id] = val;
      });
      const winnerId = r.winner ? nameToId.get(r.winner) : undefined;
      return { scores, winnerId };
    });

    const now = Date.now();
    const name = legacy.gameName?.trim() || 'My Game';
    const game: GameRecord = {
      id: crypto.randomUUID(),
      name,
      createdAt: now,
      updatedAt: now,
      players,
      rounds,
      settings: {
        rankDir: legacy.rankDir === 'low' ? 'low' : 'high',
        trackWinner: legacy.trackWinner !== false,
      },
    };

    await importGame(game);
    localStorage.setItem(MIGRATION_FLAG, '1');
    return name;
  } catch {
    localStorage.setItem(MIGRATION_FLAG, '1');
    return null;
  }
}
