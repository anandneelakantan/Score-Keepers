import { useEffect, useState } from 'react';
import type { GameRecord, Round } from '../../storage/types';
import { useToast } from '../../context/ToastContext';
import { ScoreField } from './ScoreField';
import { NumericKeypad } from './NumericKeypad';
import { WinnerSelect } from './WinnerSelect';
import { RoundHistory } from './RoundHistory';

interface RoundsTabProps {
  game: GameRecord;
  onAddRound: (round: Round) => void;
  onUndoRound: () => void;
}

export function RoundsTab({ game, onAddRound, onUndoRound }: RoundsTabProps) {
  const { notify } = useToast();
  const [scores, setScores] = useState<Record<string, string>>({});
  const [winnerId, setWinnerId] = useState('');
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    resetInputs();
    // Only re-run when the player roster changes (new game/roster applied).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.players]);

  function resetInputs() {
    const next: Record<string, string> = {};
    game.players.forEach((p) => {
      next[p.id] = '0';
    });
    setScores(next);
    setWinnerId('');
    setActiveField(null);
  }

  if (!game.players.length) {
    return (
      <div className="card">
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Set up players first in the Game setup tab.
        </div>
      </div>
    );
  }

  const roundNum = game.rounds.length + 1;

  const handleSubmit = () => {
    const parsed: Record<string, number> = {};
    let valid = true;
    game.players.forEach((p) => {
      const val = parseFloat(scores[p.id]);
      if (Number.isNaN(val)) {
        notify(`Invalid score for ${p.name}`);
        valid = false;
      }
      parsed[p.id] = Number.isNaN(val) ? 0 : val;
    });
    if (!valid) return;

    onAddRound({
      scores: parsed,
      winnerId: game.settings.trackWinner && winnerId ? winnerId : undefined,
    });
    resetInputs();
    notify(`✓ Round ${roundNum} submitted!`);
  };

  return (
    <div>
      <div className="card">
        <div className="round-header">
          <div className="round-badge">Round {roundNum}</div>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>Enter scores for each player</div>
        </div>

        {game.settings.trackWinner && (
          <WinnerSelect players={game.players} value={winnerId} onChange={setWinnerId} />
        )}

        <div className="score-grid">
          {game.players.map((p) => (
            <ScoreField
              key={p.id}
              name={p.name}
              value={scores[p.id] ?? '0'}
              active={activeField === p.id}
              onActivate={() => setActiveField(p.id)}
            />
          ))}
        </div>

        {activeField && (
          <NumericKeypad
            label={game.players.find((p) => p.id === activeField)?.name ?? ''}
            value={scores[activeField] ?? '0'}
            onChange={(v) => setScores((prev) => ({ ...prev, [activeField]: v }))}
            onDone={() => setActiveField(null)}
          />
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Submit Round ✓
          </button>
          <button type="button" className="btn btn-ghost" onClick={resetInputs}>
            Clear Scores
          </button>
        </div>
      </div>

      <div className="divider"></div>

      <div className="card-title" style={{ marginBottom: 12 }}>
        Round History
      </div>
      <RoundHistory rounds={game.rounds} players={game.players} />

      {game.rounds.length > 0 && (
        <button type="button" className="btn btn-danger" onClick={onUndoRound}>
          ↩ Undo Last Round
        </button>
      )}
    </div>
  );
}
