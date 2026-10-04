import type { ReactNode } from 'react';
import type { GameSettings } from '../../storage/types';
import { formatTimerSeconds } from '../../utils/timerAlert';

const TIMER_PRESETS = [30, 60, 90, 120];
const TARGET_STEP = 50;
const DEFAULT_TARGET = 100;

interface RulesCardProps {
  settings: GameSettings;
  onChangeRankDir: (dir: GameSettings['rankDir']) => void;
  onChangeTrackWinner: (enabled: boolean) => void;
  onChangeTimerEnabled: (enabled: boolean) => void;
  onChangeTimerSeconds: (seconds: number) => void;
  onChangeWinningPoints: (points: number | undefined) => void;
}

interface RuleProps {
  title: string;
  hint: string;
  control: ReactNode;
  disabled?: boolean;
  children?: ReactNode;
}

function Rule({ title, hint, control, disabled, children }: RuleProps) {
  return (
    <div className={`setup-rule${disabled ? ' disabled' : ''}`}>
      <div className="setup-rule-title">{title}</div>
      <div className="setup-rule-control">{control}</div>
      <div className="setup-rule-hint">{hint}</div>
      {children && <div className="setup-rule-extra">{children}</div>}
    </div>
  );
}

function Switch({ checked, label, onChange }: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider"></span>
    </label>
  );
}

export function RulesCard({
  settings,
  onChangeRankDir,
  onChangeTrackWinner,
  onChangeTimerEnabled,
  onChangeTimerSeconds,
  onChangeWinningPoints,
}: RulesCardProps) {
  const high = settings.rankDir === 'high';
  const target = settings.winningPoints;

  const targetHint = !high
    ? 'Only used when the highest score wins.'
    : target === undefined
      ? 'Play as many rounds as you like. No automatic winner.'
      : 'The first player to reach this total wins.';

  return (
    <div className="setup-card">
      <Rule
        title="Who wins"
        hint={
          high
            ? 'The player with the most points tops the leaderboard.'
            : 'The player with the fewest points tops the leaderboard, as in golf or Hearts.'
        }
        control={
          <div className="toggle-group" role="group" aria-label="Who wins">
            <button
              type="button"
              className={`toggle-btn${high ? ' active' : ''}`}
              aria-pressed={high}
              onClick={() => onChangeRankDir('high')}
            >
              ▲ Highest
            </button>
            <button
              type="button"
              className={`toggle-btn${!high ? ' active' : ''}`}
              aria-pressed={!high}
              onClick={() => onChangeRankDir('low')}
            >
              ▼ Lowest
            </button>
          </div>
        }
      />

      <Rule
        title="Play to"
        hint={targetHint}
        disabled={!high}
        control={
          <div className="setup-play-to">
            <div className="setup-stepper">
              <button
                type="button"
                aria-label="Decrease target"
                disabled={!high || target === undefined || target <= TARGET_STEP}
                onClick={() => onChangeWinningPoints((target ?? 0) - TARGET_STEP)}
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                placeholder="—"
                aria-label="Winning points"
                disabled={!high}
                value={target ?? ''}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value, 10);
                  onChangeWinningPoints(Number.isNaN(value) ? undefined : value);
                }}
              />
              <button
                type="button"
                aria-label="Increase target"
                disabled={!high}
                onClick={() => onChangeWinningPoints(target === undefined ? DEFAULT_TARGET : target + TARGET_STEP)}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={`setup-link-btn${target === undefined ? ' active' : ''}`}
              aria-pressed={target === undefined}
              disabled={!high}
              onClick={() => onChangeWinningPoints(undefined)}
            >
              No limit
            </button>
          </div>
        }
      />

      <Rule
        title="Round winner"
        hint="Mark who won each round."
        control={<Switch checked={settings.trackWinner} label="Track round winner" onChange={onChangeTrackWinner} />}
      />

      <Rule
        title="Round timer"
        hint="Count down each round. Scoring opens when the buzzer sounds."
        control={<Switch checked={settings.timer.enabled} label="Time each round" onChange={onChangeTimerEnabled} />}
      >
        {settings.timer.enabled && (
          <div className="toggle-group" role="group" aria-label="Round length">
            {TIMER_PRESETS.map((secs) => (
              <button
                key={secs}
                type="button"
                className={`toggle-btn${settings.timer.seconds === secs ? ' active' : ''}`}
                aria-pressed={settings.timer.seconds === secs}
                onClick={() => onChangeTimerSeconds(secs)}
              >
                {formatTimerSeconds(secs)}
              </button>
            ))}
          </div>
        )}
      </Rule>
    </div>
  );
}
