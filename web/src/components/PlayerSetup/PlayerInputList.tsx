import { useState } from 'react';

interface PlayerInputListProps {
  initialNames?: string[];
  onApply: (names: string[]) => void;
}

const MAX_PLAYERS = 20;

function buildInitialInputs(initialNames: string[]): string[] {
  if (initialNames.length === 0) return [''];
  if (initialNames.length < MAX_PLAYERS) return [...initialNames, ''];
  return [...initialNames];
}

export function PlayerInputList({ initialNames = [], onApply }: PlayerInputListProps) {
  const [inputs, setInputs] = useState<string[]>(() => buildInitialInputs(initialNames));

  const updateInput = (index: number, value: string) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      if (value.trim() && index === next.length - 1 && next.length < MAX_PLAYERS) {
        next.push('');
      }
      return next;
    });
  };

  const handleApply = () => {
    onApply(inputs.map((v) => v.trim()).filter(Boolean));
  };

  return (
    <div className="card">
      <div className="card-title">
        Players{' '}
        <span style={{ color: 'var(--muted)', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
          (up to {MAX_PLAYERS})
        </span>
      </div>
      <div className="player-grid">
        {inputs.map((val, i) => (
          <div className="player-input-wrap" key={i}>
            <span className="player-num">{i + 1}</span>
            <input
              className="player-input"
              type="text"
              placeholder={`Player ${i + 1}`}
              value={val}
              maxLength={20}
              onChange={(e) => updateInput(i, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <button type="button" className="btn btn-primary" onClick={handleApply}>
          Apply Players →
        </button>
      </div>
    </div>
  );
}
