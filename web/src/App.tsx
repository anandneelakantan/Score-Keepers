import { useEffect, useState } from 'react';
import { ThemeProvider, type Theme } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { GameProvider, useGames } from './context/GameContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Tabs } from './components/Tabs';
import type { TabDef } from './components/Tabs';
import { Toast } from './components/Toast';
import { PlayerSetup } from './components/PlayerSetup/PlayerSetup';
import { RoundsTab } from './components/Rounds/RoundsTab';
import { LeaderboardTab } from './components/Leaderboard/LeaderboardTab';
import { GamePickerScreen } from './components/GamePicker/GamePickerScreen';
import { useGameState } from './hooks/useGameState';
import { rememberPlayers } from './storage/playersRepository';
import './styles/theme.css';
import './styles/global.css';

const TABS: TabDef[] = [
  { id: 'setup', label: 'Game setup', icon: '⚙' },
  { id: 'rounds', label: 'Rounds', icon: '🎮' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
];

function GameShell() {
  const { activeGameId, setActiveGameId, refreshGames } = useGames();
  const { game, dispatch, loading } = useGameState(activeGameId);
  const [tab, setTab] = useState('setup');

  if (loading || !game) {
    return <div style={{ padding: 40, color: 'var(--muted)' }}>Loading…</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginLeft: 'auto' }}
          onClick={async () => {
            await refreshGames();
            setActiveGameId(null);
          }}
        >
          ← My Games
        </button>
      </div>

      <div className="tab-panel active">
        {tab === 'setup' && (
          <PlayerSetup
            game={game}
            onChangeName={(name) => dispatch({ type: 'SET_NAME', name })}
            onChangeRankDir={(dir) => dispatch({ type: 'SET_RANK_DIR', dir })}
            onChangeTrackWinner={(enabled) => dispatch({ type: 'SET_TRACK_WINNER', enabled })}
            onChangeTimerEnabled={(enabled) => dispatch({ type: 'SET_TIMER_ENABLED', enabled })}
            onChangeTimerSeconds={(seconds) => dispatch({ type: 'SET_TIMER_SECONDS', seconds })}
            onChangeWinningPoints={(points) => dispatch({ type: 'SET_WINNING_POINTS', points })}
            onStartGame={(players) => {
              rememberPlayers(players);
              dispatch({
                type: 'START_GAME',
                players: players.map((p) => ({ id: crypto.randomUUID(), name: p.name, emoji: p.emoji })),
              });
            }}
            onRenamePlayer={(id, name) => {
              rememberPlayers([{ name, emoji: game.players.find((p) => p.id === id)?.emoji }]);
              dispatch({ type: 'RENAME_PLAYER', id, name });
            }}
            onSetPlayerEmoji={(id, emoji) => {
              const player = game.players.find((p) => p.id === id);
              if (player && emoji) rememberPlayers([{ name: player.name, emoji }]);
              dispatch({ type: 'SET_PLAYER_EMOJI', id, emoji });
            }}
            onAddPlayer={(player) => {
              rememberPlayers([player]);
              dispatch({
                type: 'ADD_PLAYER',
                player: { id: crypto.randomUUID(), name: player.name, emoji: player.emoji },
              });
            }}
          />
        )}
        {tab === 'rounds' && (
          <RoundsTab
            game={game}
            onAddRound={(round) => dispatch({ type: 'ADD_ROUND', round })}
            onUndoRound={() => dispatch({ type: 'UNDO_ROUND' })}
          />
        )}
        {tab === 'leaderboard' && <LeaderboardTab game={game} />}
      </div>
    </div>
  );
}

function AppShell() {
  const { activeGameId, importedGameName } = useGames();
  const { notify } = useToast();

  useEffect(() => {
    if (importedGameName) notify(`Imported your previous scoreboard as "${importedGameName}"`);
  }, [importedGameName, notify]);

  return (
    <div className="container">
      <header>
        <div>
          <div className="logo">
            SCORE<span>BOARD</span>
          </div>
          <div className="header-meta">Game Score Tracker &nbsp;·&nbsp; Multi-Round Leaderboard</div>
        </div>
        <ThemeSwitcher />
      </header>

      {activeGameId ? <GameShell /> : <GamePickerScreen />}
      <Toast />
    </div>
  );
}

export default function App({ initialTheme }: { initialTheme: Theme }) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ToastProvider>
        <GameProvider>
          <AppShell />
        </GameProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
