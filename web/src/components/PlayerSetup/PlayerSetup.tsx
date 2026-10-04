import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import type { GameRecord, GameSettings } from '../../storage/types';
import { PlayerEditList } from './PlayerEditList';
import { PlayerInputList } from './PlayerInputList';
import { MAX_PLAYERS, validatePlayerName, type PlayerDraft } from './playerNames';
import { formatTimerSeconds } from '../../utils/timerAlert';
import { RulesCard } from './RulesCard';

interface PlayerSetupProps {
  game: GameRecord;
  onChangeName: (name: string) => void;
  onChangeRankDir: (dir: GameSettings['rankDir']) => void;
  onChangeTrackWinner: (enabled: boolean) => void;
  onChangeTimerEnabled: (enabled: boolean) => void;
  onChangeTimerSeconds: (seconds: number) => void;
  onChangeWinningPoints: (points: number | undefined) => void;
  onStartGame: (players: PlayerDraft[]) => void;
  onRenamePlayer: (id: string, name: string) => void;
  onSetPlayerEmoji: (id: string, emoji: string | undefined) => void;
  onAddPlayer: (player: PlayerDraft) => void;
}

// One line recap of the setup, shown under the game name.
function setupSummary(playerCount: number, settings: GameSettings): string[] {
  const parts = [
    `${playerCount} player${playerCount === 1 ? '' : 's'}`,
    settings.rankDir === 'high' ? 'Highest wins' : 'Lowest wins',
  ];
  if (settings.rankDir === 'high' && settings.winningPoints !== undefined) {
    parts.push(`Play to ${settings.winningPoints}`);
  }
  if (settings.timer.enabled) parts.push(`${formatTimerSeconds(settings.timer.seconds)} rounds`);
  return parts;
}

export function PlayerSetup({
  game,
  onChangeName,
  onChangeRankDir,
  onChangeTrackWinner,
  onChangeTimerEnabled,
  onChangeTimerSeconds,
  onChangeWinningPoints,
  onStartGame,
  onRenamePlayer,
  onSetPlayerEmoji,
  onAddPlayer,
}: PlayerSetupProps) {
  const { notify } = useToast();
  const inProgress = game.players.length > 0;
  const [drafts, setDrafts] = useState<PlayerDraft[]>([{ name: '' }, { name: '' }]);

  const namedDrafts = drafts
    .map((d) => ({ name: d.name.trim(), emoji: d.emoji }))
    .filter((d) => d.name);
  const playerCount = inProgress ? game.players.length : namedDrafts.length;
  const missing = Math.max(0, 2 - namedDrafts.length);

  const handleStart = () => {
    const error = namedDrafts
      .map((p, i) => validatePlayerName(p.name, namedDrafts.slice(0, i).map((q) => q.name)))
      .find(Boolean);
    if (error) {
      notify(error);
      return;
    }
    onStartGame(namedDrafts);
    notify(`✓ Game started with ${namedDrafts.length} players.`);
  };

  return (
    <div className="setup">
      <section className="setup-hero">
        <label className="setup-label" htmlFor="game-name">
          Game name
        </label>
        <input
          id="game-name"
          className="setup-title-input"
          type="text"
          placeholder="Name this game"
          maxLength={40}
          value={game.name}
          onChange={(e) => onChangeName(e.target.value)}
        />
        <div className="setup-summary">
          {setupSummary(playerCount, game.settings).map((part) => (
            <span key={part}>{part}</span>
          ))}
        </div>
      </section>

      <section className="setup-section">
        <div className="setup-section-head">
          <span className="setup-label">Players{inProgress && ' · edits keep scores'}</span>
          <span className="setup-count">
            {playerCount} / {MAX_PLAYERS}
          </span>
        </div>
        {inProgress ? (
          <PlayerEditList
            players={game.players}
            onRename={onRenamePlayer}
            onSetEmoji={onSetPlayerEmoji}
            onAdd={onAddPlayer}
          />
        ) : (
          <PlayerInputList drafts={drafts} onChange={setDrafts} />
        )}
      </section>

      <section className="setup-section">
        <div className="setup-section-head">
          <span className="setup-label">Rules</span>
        </div>
        <RulesCard
          settings={game.settings}
          onChangeRankDir={onChangeRankDir}
          onChangeTrackWinner={onChangeTrackWinner}
          onChangeTimerEnabled={onChangeTimerEnabled}
          onChangeTimerSeconds={onChangeTimerSeconds}
          onChangeWinningPoints={onChangeWinningPoints}
        />
      </section>

      {!inProgress && (
        <div className="setup-startbar">
          <button type="button" className="btn btn-primary" disabled={missing > 0} onClick={handleStart}>
            {missing > 0 ? 'Start game' : `Start game · ${namedDrafts.length} players →`}
          </button>
          {missing > 0 && (
            <div className="setup-start-hint">
              Add {missing} more player{missing === 1 ? '' : 's'} to start
            </div>
          )}
        </div>
      )}
    </div>
  );
}
