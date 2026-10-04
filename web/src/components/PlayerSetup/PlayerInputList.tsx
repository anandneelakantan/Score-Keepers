import { useKnownPlayers } from '../../hooks/useKnownPlayers';
import { AvatarPicker } from './AvatarPicker';
import { KNOWN_PLAYERS_LIST_ID, KnownPlayerOptions } from './KnownPlayerOptions';
import { MAX_PLAYERS, type PlayerDraft } from './playerNames';

interface PlayerInputListProps {
  drafts: PlayerDraft[];
  onChange: (drafts: PlayerDraft[]) => void;
}

export function PlayersCardTitle({ hint }: { hint?: string }) {
  return (
    <div className="card-title">
      Players{' '}
      <span style={{ color: 'var(--muted)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
        (up to {MAX_PLAYERS}){hint ? ` · ${hint}` : ''}
      </span>
    </div>
  );
}

export function PlayerInputList({ drafts, onChange }: PlayerInputListProps) {
  const { players: knownPlayers, find: findKnownPlayer } = useKnownPlayers();

  const updateName = (index: number, value: string) => {
    const next = [...drafts];
    // Picking a remembered player brings back their avatar.
    const emoji = next[index].emoji ?? findKnownPlayer(value)?.emoji;
    next[index] = { ...next[index], name: value, emoji };
    if (value.trim() && index === next.length - 1 && next.length < MAX_PLAYERS) {
      next.push({ name: '' });
    }
    onChange(next);
  };

  const updateEmoji = (index: number, emoji: string | undefined) => {
    const next = [...drafts];
    next[index] = { ...next[index], emoji };
    onChange(next);
  };

  return (
    <div className="card">
      <PlayersCardTitle />
      <KnownPlayerOptions players={knownPlayers} exclude={drafts.map((d) => d.name)} />
      <div className="player-grid">
        {drafts.map((draft, i) => (
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
              list={KNOWN_PLAYERS_LIST_ID}
              autoComplete="off"
              value={draft.name}
              maxLength={20}
              onChange={(e) => updateName(i, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
