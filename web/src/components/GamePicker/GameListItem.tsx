import type { GameRecord } from '../../storage/types';

interface GameListItemProps {
  game: GameRecord;
  onOpen: () => void;
  onDelete: () => void;
}

export function GameListItem({ game, onOpen, onDelete }: GameListItemProps) {
  return (
    <div
      className="round-entry"
      style={{ justifyContent: 'space-between' }}
      data-testid="game-list-item"
      data-game-name={game.name}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lb-name">{game.name}</div>
        <div className="lb-round-wins">
          {game.players.length} players · {game.rounds.length} rounds · updated{' '}
          {new Date(game.updatedAt).toLocaleString()}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={onOpen}>
          Open
        </button>
        <button type="button" className="btn btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
