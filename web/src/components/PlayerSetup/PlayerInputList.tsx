import { useEffect, useRef, useState } from 'react';
import { useKnownPlayers } from '../../hooks/useKnownPlayers';
import type { KnownPlayer } from '../../storage/types';
import { AvatarPicker } from './AvatarPicker';
import { KNOWN_PLAYERS_LIST_ID, KnownPlayerOptions } from './KnownPlayerOptions';
import { MAX_PLAYERS, type PlayerDraft } from './playerNames';
import { RecentPlayers } from './RecentPlayers';

interface PlayerInputListProps {
  drafts: PlayerDraft[];
  onChange: (drafts: PlayerDraft[]) => void;
}

export function PlayerInputList({ drafts, onChange }: PlayerInputListProps) {
  const { players: knownPlayers, find: findKnownPlayer } = useKnownPlayers();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  // Focus after render, so a newly added row exists before we focus it.
  useEffect(() => {
    if (focusIndex === null) return;
    inputs.current[focusIndex]?.focus();
    setFocusIndex(null);
  }, [focusIndex]);

  const emptyIndex = drafts.findIndex((d) => !d.name.trim());
  const full = emptyIndex === -1 && drafts.length >= MAX_PLAYERS;

  const updateName = (index: number, value: string) => {
    const next = [...drafts];
    // Picking a remembered player brings back their avatar.
    const emoji = next[index].emoji ?? findKnownPlayer(value)?.emoji;
    next[index] = { ...next[index], name: value, emoji };
    onChange(next);
  };

  const updateEmoji = (index: number, emoji: string | undefined) => {
    const next = [...drafts];
    next[index] = { ...next[index], emoji };
    onChange(next);
  };

  const remove = (index: number) => {
    const next = drafts.filter((_, i) => i !== index);
    onChange(next.length ? next : [{ name: '' }]);
  };

  // Reuse an empty row before adding another.
  const addRow = () => {
    if (emptyIndex !== -1) {
      setFocusIndex(emptyIndex);
      return;
    }
    if (full) return;
    onChange([...drafts, { name: '' }]);
    setFocusIndex(drafts.length);
  };

  const addKnown = (player: KnownPlayer) => {
    const draft = { name: player.name, emoji: player.emoji };
    if (emptyIndex !== -1) {
      onChange(drafts.map((d, i) => (i === emptyIndex ? draft : d)));
    } else if (!full) {
      onChange([...drafts, draft]);
    }
  };

  return (
    <>
      <div className="setup-card">
        <KnownPlayerOptions players={knownPlayers} exclude={drafts.map((d) => d.name)} />
        {drafts.map((draft, i) => (
          <div className="setup-player-row" key={i}>
            {draft.name.trim() ? (
              <AvatarPicker
                name={draft.name}
                colorKey={String(i)}
                emoji={draft.emoji}
                size={36}
                onChange={(emoji) => updateEmoji(i, emoji)}
              />
            ) : (
              <span className="setup-avatar-empty">{i + 1}</span>
            )}
            <input
              ref={(el) => {
                inputs.current[i] = el;
              }}
              className="setup-name-input"
              type="text"
              placeholder={`Player ${i + 1}`}
              aria-label={`Player ${i + 1} name`}
              list={KNOWN_PLAYERS_LIST_ID}
              autoComplete="off"
              value={draft.name}
              maxLength={20}
              onChange={(e) => updateName(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draft.name.trim()) {
                  e.preventDefault();
                  addRow();
                }
              }}
            />
            <button
              type="button"
              className="setup-remove-btn"
              aria-label={`Remove player ${i + 1}`}
              onClick={() => remove(i)}
            >
              ✕
            </button>
          </div>
        ))}
        {!full && (
          <button type="button" className="setup-player-row setup-add-row" onClick={addRow}>
            <span className="setup-add-icon">＋</span>
            Add player
          </button>
        )}
      </div>
      {!full && (
        <RecentPlayers players={knownPlayers} exclude={drafts.map((d) => d.name)} onPick={addKnown} />
      )}
    </>
  );
}
