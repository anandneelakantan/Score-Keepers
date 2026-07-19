import { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
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
            onApplyPlayers={(names) =>
              dispatch({
                type: 'APPLY_PLAYERS',
                players: names.map((name) => ({ id: crypto.randomUUID(), name })),
              })
            }
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

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <GameProvider>
          <AppShell />
        </GameProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
