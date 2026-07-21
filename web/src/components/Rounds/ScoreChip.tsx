import { PlayerAvatar } from '../PlayerAvatar';

interface ScoreChipProps {
  playerId: string;
  name: string;
  score: number;
}

export function ScoreChip({ playerId, name, score }: ScoreChipProps) {
  return (
    <span className="score-chip">
      <PlayerAvatar name={name} colorKey={playerId} size={16} />
      <span>{name}:</span> {score >= 0 ? '+' : ''}
      {score}
    </span>
  );
}
