interface ScoreChipProps {
  name: string;
  score: number;
}

export function ScoreChip({ name, score }: ScoreChipProps) {
  return (
    <span className="score-chip">
      <span>{name}:</span> {score >= 0 ? '+' : ''}
      {score}
    </span>
  );
}
