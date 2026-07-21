// Fixed, hand-picked hues spaced around the color wheel so adjacent players
// are visually distinct even as more players are added.
const PALETTE = [
  '#e05d5d', // red
  '#e0904a', // orange
  '#d9c04a', // yellow
  '#8ec24a', // lime
  '#4ac27a', // green
  '#4ac2ae', // teal
  '#4aa8e0', // sky
  '#5d7de0', // blue
  '#8a5de0', // violet
  '#c04ad9', // magenta
  '#e04a9a', // pink
  '#a0784a', // brown
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPlayerColor(key: string): string {
  if (!key) return PALETTE[0];
  return PALETTE[hashString(key) % PALETTE.length];
}

export function getPlayerInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}
