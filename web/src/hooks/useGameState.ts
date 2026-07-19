import { useEffect, useReducer, useState } from 'react';
import type { GameRecord, GameSettings, Player, Round } from '../storage/types';
import { getGame, saveGame } from '../storage/gamesRepository';

type Action =
  | { type: 'RESET' }
  | { type: 'LOADED'; game: GameRecord }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_RANK_DIR'; dir: GameSettings['rankDir'] }
  | { type: 'SET_TRACK_WINNER'; enabled: boolean }
  | { type: 'APPLY_PLAYERS'; players: Player[] }
  | { type: 'ADD_ROUND'; round: Round }
  | { type: 'UNDO_ROUND' };

function reducer(game: GameRecord | null, action: Action): GameRecord | null {
  if (action.type === 'RESET') return null;
  if (action.type === 'LOADED') return action.game;
  if (!game) return game;

  switch (action.type) {
    case 'SET_NAME':
      return { ...game, name: action.name };
    case 'SET_RANK_DIR':
      return { ...game, settings: { ...game.settings, rankDir: action.dir } };
    case 'SET_TRACK_WINNER': {
      const trackWinner = action.enabled;
      const rounds = trackWinner
        ? game.rounds
        : game.rounds.map((r) => ({ ...r, winnerId: undefined }));
      return { ...game, settings: { ...game.settings, trackWinner }, rounds };
    }
    case 'APPLY_PLAYERS':
      return { ...game, players: action.players, rounds: [] };
    case 'ADD_ROUND':
      return { ...game, rounds: [...game.rounds, action.round] };
    case 'UNDO_ROUND':
      return { ...game, rounds: game.rounds.slice(0, -1) };
    default:
      return game;
  }
}

export function useGameState(gameId: string | null) {
  const [game, dispatch] = useReducer(reducer, null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'RESET' });
    if (!gameId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getGame(gameId).then((g) => {
      if (cancelled) return;
      if (g) dispatch({ type: 'LOADED', game: g });
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  useEffect(() => {
    if (game) saveGame(game);
  }, [game]);

  return { game, dispatch, loading };
}
