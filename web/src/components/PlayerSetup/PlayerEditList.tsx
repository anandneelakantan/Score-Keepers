import { useState, type KeyboardEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import type { Player } from '../../storage/types';
import { AvatarPicker } from './AvatarPicker';
import { PlayersCardTitle } from './PlayerInputList';
import { MAX_PLAYERS, validatePlayerName, type PlayerDraft } from './playerNames';

interface PlayerEditListProps {
  players: Player[];
  onRename: (id: string, name: string) => void;
  onSetEmoji: (id: string, emoji: string | undefined) => void;
  onAdd: (player: PlayerDraft) => void;
}

// Enter commits the field the same way leaving it does.
const blurOnEnter = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') e.currentTarget.blur();
};

interface PlayerRowProps {
  player: Player;
  index: number;
  otherNames: string[];
  onRename: (name: string) => void;
  onSetEmoji: (emoji: string | undefined) => void;
}

function PlayerRow({ player, index, otherNames, onRename, onSetEmoji }: PlayerRowProps) {
  const { notify } = useToast();
  const [value, setValue] = useState(player.name);

  const commit = () => {
    const name = value.trim();
    if (name === player.name) {
      setValue(player.name);
      return;
    }
    const error = validatePlayerName(name, otherNames);
    if (error) {
      notify(error);
      setValue(player.name);
      return;
    }
    onRename(name);
    setValue(name);
  };

  return (
    <div className="player-input-wrap">
      <AvatarPicker
        name={player.name}
        colorKey={player.id}
        emoji={player.emoji}
        size={38}
        onChange={onSetEmoji}
      />
      <input
        className="player-input"
        type="text"
        placeholder={`Player ${index + 1}`}
        value={value}
        maxLength={20}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={blurOnEnter}
      />
    </div>
  );
}

export function PlayerEditList({ players, onRename, onSetEmoji, onAdd }: PlayerEditListProps) {
  const { notify } = useToast();
  const [newName, setNewName] = useState('');
  const names = players.map((p) => p.name);

  const commitNew = () => {
    const name = newName.trim();
    if (!name) {
      setNewName('');
      return;
    }
    const error = validatePlayerName(name, names);
    if (error) {
      notify(error);
      return;
    }
    onAdd({ name });
    setNewName('');
    notify(`✓ ${name} added.`);
  };

  return (
    <div className="card">
      <PlayersCardTitle hint="edits keep scores" />
      <div className="player-grid">
        {players.map((p, i) => (
          <PlayerRow
            key={p.id}
            player={p}
            index={i}
            otherNames={names.filter((_, j) => j !== i)}
            onRename={(name) => onRename(p.id, name)}
            onSetEmoji={(emoji) => onSetEmoji(p.id, emoji)}
          />
        ))}
        {players.length < MAX_PLAYERS && (
          <div className="player-input-wrap">
            <span className="player-avatar player-avatar-empty">{players.length + 1}</span>
            <input
              className="player-input"
              type="text"
              placeholder={`Player ${players.length + 1}`}
              value={newName}
              maxLength={20}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={commitNew}
              onKeyDown={blurOnEnter}
            />
          </div>
        )}
      </div>
    </div>
  );
}
