/**
 * @file SaveIndicator.tsx
 * @description The quiet state of an automatic save: a dot and one word ("Saving", "Saved", "Could not save"). There is no Save button; the document saves as it is edited, and this only says so. It keeps its place, so nothing around it jumps: in `idle="hidden"` it fades out when idle (the docked bar), in `idle="saved"` it rests on "Saved" (a panel footer). It is one polite live region. The app owns when a save starts and ends (its store or draft hook); this draws the state.
 * @app SHARED - Generic: knows nothing about any app's saving.
 * Used by: the docked bar (document saves) and the footers of the event and task panels.
 */
import React from 'react';
import { cn } from '@frameer/lib/design-system';
import { ChromeIcon } from './ChromeIcons';

export type SaveState = 'idle' | 'saving' | 'saved' | 'failed';

export interface SaveIndicatorProps {
  status: SaveState;
  /** What the indicator rests on while `status` is `idle`: `hidden` fades out and keeps its place (default), `saved` shows "Saved". */
  idle?: 'hidden' | 'saved';
  /** `dot` is a small round dot (green once saved); `check` cross-fades a pulsing dot and a check in one slot. */
  variant?: 'dot' | 'check';
  /** Words per state. Defaults: "Saving", "Saved", "Could not save". Pass "Saved on this device" for a write that waits offline. */
  labels?: Partial<Record<Exclude<SaveState, 'idle'>, string>>;
  /** Why nothing is written, in words; replaces the state's words and the mark. */
  problem?: string | null;
  /** `data-testid`. */
  testId?: string;
  className?: string;
}

const WORDS: Record<Exclude<SaveState, 'idle'>, string> = { saving: 'Saving', saved: 'Saved', failed: 'Could not save' };

/** The dot and the word of a save, in a fixed place. */
export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status, idle = 'hidden', variant = 'dot', labels, problem = null, testId, className }) => {
  const hidden = status === 'idle' && idle === 'hidden';
  const shown: Exclude<SaveState, 'idle'> = status === 'idle' ? 'saved' : status;
  const saving = status === 'saving';
  const words = problem ?? labels?.[shown] ?? WORDS[shown];
  return (
    <span
      role="status"
      aria-live="polite"
      aria-hidden={hidden || undefined}
      data-testid={testId}
      data-status={status}
      className={cn(
        'flex flex-shrink-0 items-center gap-1.5 text-[12.5px] text-[var(--ink-2)] transition-opacity duration-[var(--dur-gentle)] ease-[var(--ease-out)]',
        hidden ? 'opacity-0' : 'opacity-100',
        className,
      )}
    >
      {problem ? null : variant === 'check' ? (
        <span aria-hidden="true" className="relative inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center">
          <span className={cn('absolute h-1.5 w-1.5 rounded-full bg-current transition-all duration-300', saving ? 'scale-100 animate-pulse opacity-100' : 'scale-0 opacity-0')} />
          <ChromeIcon
            name="check"
            className={cn('absolute h-3.5 w-3.5 text-[var(--hue-green-ink)] transition-all duration-300', saving || status === 'failed' ? 'scale-50 opacity-0' : 'scale-100 opacity-100')}
          />
        </span>
      ) : (
        <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', saving || status === 'failed' ? 'bg-[var(--ink-3)]' : 'bg-[var(--hue-green-stroke)]')} />
      )}
      {words}
    </span>
  );
};
