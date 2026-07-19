interface ScoreFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export function ScoreField({ name, value, onChange }: ScoreFieldProps) {
  return (
    <div className="score-field">
      <div className="score-field-name" title={name}>
        {name}
      </div>
      <input
        className="score-input"
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
