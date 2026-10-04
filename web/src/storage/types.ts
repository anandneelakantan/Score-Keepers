export interface Player {
  id: string;
  name: string;
  emoji?: string;
}

export interface Round {
  scores: Record<string, number>; // playerId -> score for that round
  winnerId?: string;
}

export interface TimerSettings {
  enabled: boolean;
  seconds: number;
}

export interface GameSettings {
  rankDir: 'high' | 'low';
  trackWinner: boolean;
  timer: TimerSettings;
  winningPoints?: number; // total a player must reach to win; unset means no target
}

export interface GameRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  players: Player[];
  rounds: Round[];
  settings: GameSettings;
}

// A player remembered across games, used to suggest names during setup.
export interface KnownPlayer {
  key: string; // lowercased name, so names match case-insensitively
  name: string;
  emoji?: string;
  lastUsed: number;
}

export type Theme = 'dark' | 'light' | 'auto';

export interface AppSettings {
  theme: Theme;
  legacyMigrated: boolean;
}
