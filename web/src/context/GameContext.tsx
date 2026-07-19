import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameRecord } from '../storage/types';
import { listGames } from '../storage/gamesRepository';
import { migrateLegacyStateIfNeeded } from '../storage/migrateLegacyState';

interface GameContextValue {
  activeGameId: string | null;
  setActiveGameId: (id: string | null) => void;
  games: GameRecord[];
  refreshGames: () => Promise<void>;
  importedGameName: string | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [games, setGames] = useState<GameRecord[]>([]);
  const [importedGameName, setImportedGameName] = useState<string | null>(null);

  const refreshGames = useCallback(async () => {
    setGames(await listGames());
  }, []);

  useEffect(() => {
    (async () => {
      const imported = await migrateLegacyStateIfNeeded();
      if (imported) setImportedGameName(imported);
      await refreshGames();
    })();
  }, [refreshGames]);

  return (
    <GameContext.Provider
      value={{ activeGameId, setActiveGameId, games, refreshGames, importedGameName }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGames must be used within GameProvider');
  return ctx;
}
