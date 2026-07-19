import { useGames } from '../../context/GameContext';
import { useToast } from '../../context/ToastContext';
import { createGame, deleteGame, renameGame } from '../../storage/gamesRepository';
import { GameListItem } from './GameListItem';
import { NewGameDialog } from './NewGameDialog';

export function GamePickerScreen() {
  const { games, refreshGames, setActiveGameId } = useGames();
  const { notify } = useToast();

  const handleCreate = async (name: string) => {
    const game = await createGame(name);
    await refreshGames();
    setActiveGameId(game.id);
  };

  const handleDelete = async (id: string) => {
    await deleteGame(id);
    await refreshGames();
  };

  const handleRename = async (id: string, name: string) => {
    await renameGame(id, name);
    await refreshGames();
    notify('Game renamed.');
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">New Game</div>
        <NewGameDialog onCreate={handleCreate} />
      </div>

      <div className="card-title" style={{ marginBottom: 12 }}>
        My Games
      </div>
      {games.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎲</div>
          <p>
            No saved games yet.
            <br />
            Create one above to get started.
          </p>
        </div>
      ) : (
        <div className="rounds-list" style={{ maxHeight: 'none' }}>
          {games.map((g) => (
            <GameListItem
              key={g.id}
              game={g}
              onOpen={() => setActiveGameId(g.id)}
              onRename={(name) => handleRename(g.id, name)}
              onDelete={() => handleDelete(g.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
