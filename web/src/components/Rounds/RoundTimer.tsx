import { useEffect, useRef } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { playCompletionBeep, playTickBeep, vibrateAlert } from '../../utils/timerAlert';

const TICK_BEEP_THRESHOLD = 5;

interface RoundTimerProps {
  seconds: number;
  onExpire: () => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RoundTimer({ seconds, onExpire }: RoundTimerProps) {
  const { remaining, isRunning, isExpired, start, pause, reset } = useCountdown(seconds);
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
    if (!isExpired) notifiedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  const pct = Math.max(0, Math.min(100, (remaining / seconds) * 100));

  return (
    <div className={`round-timer${isExpired ? ' round-timer-expired' : ''}`}>
      <div className="round-timer-top">
        <span className="round-timer-label">Round timer</span>
        <span className="round-timer-value">{formatTime(remaining)}</span>
      </div>
      <div className="round-timer-track">
        <div className="round-timer-fill" style={{ width: `${pct}%` }}></div>
      </div>
      <div className="round-timer-actions">
        {isRunning ? (
          <button type="button" className="btn btn-ghost" onClick={pause}>
            ⏸ Pause
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={start}>
            {remaining === seconds ? '▶ Start Round' : '▶ Resume'}
          </button>
        )}
        {remaining !== seconds && (
          <button type="button" className="btn btn-ghost" onClick={reset}>
            ↺ Reset
          </button>
        )}
      </div>
    </div>
  );
}
