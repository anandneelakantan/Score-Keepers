export interface Player {
  id: string;
  name: string;
}

export interface Round {
  scores: Record<string, number>; // playerId -> score for that round
  winnerId?: string;
}

export interface GameSettings {
  rankDir: 'high' | 'low';
  trackWinner: boolean;
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
