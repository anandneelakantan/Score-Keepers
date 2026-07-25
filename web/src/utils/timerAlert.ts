// Best-effort audio/haptic cues. Silently skipped where unsupported.

export function vibrateAlert() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([120, 80, 120]);
  }
}

function getAudioContext(): AudioContext | null {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return AudioCtx ? new AudioCtx() : null;
}

function tone(frequency: number, duration: number, peakGain = 0.2) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  const start = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peakGain, start + 0.02);
  gain.gain.setValueAtTime(peakGain, start + Math.max(duration - 0.15, 0.02));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
  oscillator.onended = () => ctx.close();
}

// Short tick for each of the final 5 seconds of a round.
export function playTickBeep() {
  tone(880, 0.15);
}

// Long tone marking the round timer hitting zero.
export function playCompletionBeep() {
  tone(660, 3, 0.25);
}
