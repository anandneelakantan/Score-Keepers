// Returns an error message if `name` can't be used alongside `otherNames`, else null.
export function validatePlayerName(name: string, otherNames: string[]): string | null {
  if (!name) return 'Player name cannot be empty.';
  const lower = name.toLowerCase();
  if (otherNames.some((n) => n.toLowerCase() === lower)) return 'Player names must be unique.';
  return null;
}

export const MAX_PLAYERS = 20;

export interface PlayerDraft {
  name: string;
  emoji?: string;
}
