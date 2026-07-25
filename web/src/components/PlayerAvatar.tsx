import { getPlayerColor, getPlayerInitial } from '../utils/playerColor';
import type { CSSProperties } from 'react';

interface PlayerAvatarProps {
  name: string;
  colorKey?: string;
  emoji?: string;
  size?: number;
}

export function PlayerAvatar({ name, colorKey, emoji, size = 26 }: PlayerAvatarProps) {
  const initial = getPlayerInitial(name);
  const color = getPlayerColor(colorKey || name);

  return (
    <span
      className={`player-avatar${emoji ? ' player-avatar-emoji' : ''}`}
      style={
        {
          width: size,
          height: size,
          fontSize: Math.max(10, Math.round(size * (emoji ? 0.56 : 0.46))),
          '--pa-color': color,
        } as CSSProperties
      }
    >
      {emoji || initial}
    </span>
  );
}
