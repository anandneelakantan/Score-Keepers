import { useEffect, useRef, useState } from 'react';

export function useCountdown(totalSeconds: number) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // A new round duration invalidates any in-flight countdown.
  useEffect(() => {
    setRemaining(totalSeconds);
    setIsRunning(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = () => {
    // Starting from expired begins a fresh countdown; starting from paused resumes it.
    setRemaining((prev) => (prev <= 0 ? totalSeconds : prev));
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setRemaining(totalSeconds);
  };

  return { remaining, isRunning, isExpired: remaining === 0, start, pause, reset };
}
