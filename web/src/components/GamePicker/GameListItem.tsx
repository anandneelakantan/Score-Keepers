import { useState } from 'react';
import type { GameRecord } from '../../storage/types';

interface GameListItemProps {
  game: GameRecord;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export function GameListItem({ game, onOpen, onRename, onDelete }: GameListItemProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(game.name);

  const commitRename = () => {
    setEditing(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== game.name) onRename(trimmed);
    else setName(game.name);
  };

  return (
    <div
      className="round-entry"
      style={{ justifyContent: 'space-between' }}
      data-testid="game-list-item"
      data-game-name={game.name}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input
            className="player-input"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
            }}
          />
        ) : (
          <div className="lb-name">{game.name}</div>
        )}
        <div className="lb-round-wins">
          {game.players.length} players · {game.rounds.length} rounds · updated{' '}
          {new Date(game.updatedAt).toLocaleString()}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={onOpen}>
          Open
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
          Rename
        </button>
        <button type="button" className="btn btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
