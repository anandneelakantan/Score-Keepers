import { useState, type KeyboardEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { useKnownPlayers } from '../../hooks/useKnownPlayers';
import type { KnownPlayer, Player } from '../../storage/types';
import { AvatarPicker } from './AvatarPicker';
import { KNOWN_PLAYERS_LIST_ID, KnownPlayerOptions } from './KnownPlayerOptions';
import { MAX_PLAYERS, validatePlayerName, type PlayerDraft } from './playerNames';
import { RecentPlayers } from './RecentPlayers';

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
    <div className="setup-player-row">
      <AvatarPicker
        name={player.name}
        colorKey={player.id}
        emoji={player.emoji}
        size={36}
        onChange={onSetEmoji}
      />
      <input
        className="setup-name-input"
        type="text"
        placeholder={`Player ${index + 1}`}
        aria-label={`Player ${index + 1} name`}
        list={KNOWN_PLAYERS_LIST_ID}
        autoComplete="off"
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
  const { players: knownPlayers, find: findKnownPlayer } = useKnownPlayers();
  const full = players.length >= MAX_PLAYERS;

  const add = (player: PlayerDraft) => {
    const error = validatePlayerName(player.name, names);
    if (error) {
      notify(error);
      return false;
    }
    onAdd(player);
    notify(`✓ ${player.name} added.`);
    return true;
  };

  const commitNew = () => {
    const name = newName.trim();
    if (!name || add({ name, emoji: findKnownPlayer(name)?.emoji })) setNewName('');
  };

  const addKnown = (player: KnownPlayer) => add({ name: player.name, emoji: player.emoji });

  return (
    <>
      <div className="setup-card">
        <KnownPlayerOptions players={knownPlayers} exclude={names} />
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
        {!full && (
          <div className="setup-player-row setup-add-row">
            <span className="setup-add-icon">＋</span>
            <input
              className="setup-name-input"
              type="text"
              placeholder="Add a late joiner"
              aria-label="New player name"
              list={KNOWN_PLAYERS_LIST_ID}
              autoComplete="off"
              value={newName}
              maxLength={20}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={commitNew}
              onKeyDown={blurOnEnter}
            />
          </div>
        )}
      </div>
      {!full && <RecentPlayers players={knownPlayers} exclude={names} onPick={addKnown} />}
    </>
  );
}
