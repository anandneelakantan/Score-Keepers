import { useState } from 'react';

interface NewGameDialogProps {
  onCreate: (name: string) => void;
}

export function NewGameDialog({ onCreate }: NewGameDialogProps) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    onCreate(name.trim() || 'New Game');
    setName('');
  };

  return (
    <div className="settings-row">
      <input
        className="player-input"
        type="text"
        placeholder="New game name"
        maxLength={40}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCreate();
        }}
      />
      <button type="button" className="btn btn-primary" onClick={handleCreate}>
        + New Game
      </button>
    </div>
  );
}
