import { getPlayerColor, getPlayerInitial } from '../utils/playerColor';

interface PlayerAvatarProps {
  name: string;
  colorKey?: string;
  size?: number;
}

export function PlayerAvatar({ name, colorKey, size = 26 }: PlayerAvatarProps) {
  const initial = getPlayerInitial(name);
  const color = getPlayerColor(colorKey || name);

  return (
    <span
      className="player-avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.46)),
        background: color,
      }}
    >
      {initial}
    </span>
  );
}
