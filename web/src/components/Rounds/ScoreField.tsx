interface ScoreFieldProps {
  name: string;
  value: string;
  active: boolean;
  onActivate: () => void;
}

export function ScoreField({ name, value, active, onActivate }: ScoreFieldProps) {
  return (
    <div className="score-field">
      <div className="score-field-name" title={name}>
        {name}
      </div>
      <input
        className={`score-input${active ? ' score-input-active' : ''}`}
        type="text"
        inputMode="none"
        readOnly
        value={value}
        onFocus={onActivate}
        onClick={onActivate}
      />
    </div>
  );
}
