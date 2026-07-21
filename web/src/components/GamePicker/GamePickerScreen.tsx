import { useGames } from '../../context/GameContext';
import { createGame, deleteGame } from '../../storage/gamesRepository';
import { GameListItem } from './GameListItem';
import { NewGameDialog } from './NewGameDialog';

export function GamePickerScreen() {
  const { games, refreshGames, setActiveGameId } = useGames();

  const handleCreate = async (name: string) => {
    const game = await createGame(name);
    await refreshGames();
    setActiveGameId(game.id);
  };

  const handleDelete = async (id: string) => {
    await deleteGame(id);
    await refreshGames();
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
              onDelete={() => handleDelete(g.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
