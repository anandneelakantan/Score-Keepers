import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { playCompletionBeep, playTickBeep, vibrateAlert } from '../../utils/timerAlert';

const TICK_BEEP_THRESHOLD = 5;

interface RoundTimerProps {
  seconds: number;
  roundNum: number;
  onExpire: () => void;
  onSkip: () => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RoundTimer({ seconds, roundNum, onExpire, onSkip }: RoundTimerProps) {
  const { remaining, isRunning, isExpired, start, reset } = useCountdown(seconds);
  const notifiedRef = useRef(false);
  const prevRemainingRef = useRef(remaining);

  // Tick beep for each second remaining drops to within the last 5 seconds.
  // Compares against the previous value (rather than a fixed set) so pausing,
  // resuming, or resetting mid-round never re-triggers or skips a beep.
  useEffect(() => {
    const prev = prevRemainingRef.current;
    prevRemainingRef.current = remaining;
    if (isRunning && remaining < prev && remaining >= 1 && remaining <= TICK_BEEP_THRESHOLD) {
      playTickBeep();
    }
  }, [remaining, isRunning]);

  useEffect(() => {
    if (isExpired && !notifiedRef.current) {
      notifiedRef.current = true;
      vibrateAlert();
      playCompletionBeep();
      onExpire();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  if (!isRunning) {
    return (
      <div className="timer-screen timer-screen-ready">
        <div>
          <div className="timer-phase-label">Get ready</div>
          <div className="timer-title">Round {roundNum}</div>
        </div>
        <div className="timer-ring timer-ring-ready">
          <div className="timer-time">{formatTime(seconds)}</div>
          <div className="timer-sub">on the clock</div>
        </div>
        <div className="timer-actions">
          <button type="button" className="btn btn-primary" onClick={start}>
            ▶ Start round
          </button>
          <button type="button" className="btn-link" onClick={onSkip}>
            Skip timer
          </button>
        </div>
      </div>
    );
  }

  const deg = Math.max(0, Math.min(360, 360 * (remaining / seconds)));

  return (
    <div className="timer-screen timer-screen-running">
      <div className="timer-phase-label">⏱ Round in play</div>
      <div className="timer-ring" style={{ '--timer-deg': `${deg}deg` } as CSSProperties}>
        <div className="timer-ring-inner">
          <div className="timer-time">{formatTime(remaining)}</div>
        </div>
      </div>
      <div className="timer-actions">
        <button type="button" className="btn btn-ghost" onClick={reset}>
          ■ Stop timer
        </button>
        <button type="button" className="btn-link" onClick={onSkip}>
          Skip to scoring
        </button>
      </div>
    </div>
  );
}
