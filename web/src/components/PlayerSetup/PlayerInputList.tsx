import { useState } from 'react';
import { AvatarPicker } from './AvatarPicker';

export interface PlayerDraft {
  name: string;
  emoji?: string;
}

interface PlayerInputListProps {
  initialPlayers?: PlayerDraft[];
  onApply: (players: PlayerDraft[]) => void;
}

const MAX_PLAYERS = 20;

function buildInitialInputs(initialPlayers: PlayerDraft[]): PlayerDraft[] {
  if (initialPlayers.length === 0) return [{ name: '' }];
  if (initialPlayers.length < MAX_PLAYERS) return [...initialPlayers, { name: '' }];
  return [...initialPlayers];
}

export function PlayerInputList({ initialPlayers = [], onApply }: PlayerInputListProps) {
  const [inputs, setInputs] = useState<PlayerDraft[]>(() => buildInitialInputs(initialPlayers));

  const updateName = (index: number, value: string) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: value };
      if (value.trim() && index === next.length - 1 && next.length < MAX_PLAYERS) {
        next.push({ name: '' });
      }
      return next;
    });
  };

  const updateEmoji = (index: number, emoji: string | undefined) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], emoji };
      return next;
    });
  };

  const handleApply = () => {
    onApply(
      inputs
        .map((d) => ({ name: d.name.trim(), emoji: d.emoji }))
        .filter((d) => d.name),
    );
  };

  return (
    <div className="card">
      <div className="card-title">
        Players{' '}
        <span style={{ color: 'var(--muted)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          (up to {MAX_PLAYERS})
        </span>
      </div>
      <div className="player-grid">
        {inputs.map((draft, i) => (
          <div className="player-input-wrap" key={i}>
            {draft.name.trim() ? (
              <AvatarPicker
                name={draft.name}
                colorKey={String(i)}
                emoji={draft.emoji}
                size={38}
                onChange={(emoji) => updateEmoji(i, emoji)}
              />
            ) : (
              <span className="player-avatar player-avatar-empty">{i + 1}</span>
            )}
            <input
              className="player-input"
              type="text"
              placeholder={`Player ${i + 1}`}
              value={draft.name}
              maxLength={20}
              onChange={(e) => updateName(i, e.target.value)}
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
