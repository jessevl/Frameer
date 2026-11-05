/**
 * @file pausableTimer.ts
 * @description A countdown that can be paused and resumed, so a toast holding an Undo does not run out while the pointer or focus is on it. The time left is kept, not restarted.
 * Ported from lighthouse@dd62578:frontend/src/lib/toast-timer.ts
 * Used by: Toast.
 */
export interface PausableTimer {
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  /** Milliseconds left (the full duration until it starts running down). */
  remaining: () => number;
}

export function createPausableTimer(durationMs: number, onDone: () => void): PausableTimer {
  let left = durationMs;
  let startedAt = 0;
  let handle: ReturnType<typeof setTimeout> | null = null;
  let done = false;

  const run = () => {
    if (done || handle != null) return;
    startedAt = Date.now();
    handle = setTimeout(() => {
      handle = null;
      done = true;
      left = 0;
      onDone();
    }, left);
  };

  run();

  return {
    pause: () => {
      if (handle == null) return;
      clearTimeout(handle);
      handle = null;
      left = Math.max(0, left - (Date.now() - startedAt));
    },
    resume: run,
    cancel: () => {
      if (handle != null) clearTimeout(handle);
      handle = null;
      done = true;
    },
    remaining: () => (handle == null ? left : Math.max(0, left - (Date.now() - startedAt))),
  };
}
