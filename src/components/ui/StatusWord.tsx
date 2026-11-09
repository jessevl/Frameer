/**
 * @file StatusWord.tsx
 * @description A 7 px dot with a soft 3 px ring and always a word (tones ok, warn, bad, quiet), so a state is never colour alone.
 * Used by: status columns and facts in every app.
 */
import type { ReactNode } from 'react';

export type StatusTone = 'ok' | 'warn' | 'bad' | 'quiet';

export function StatusWord({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className="fr-status" data-tone={tone}>
      <span className="fr-status-dot" aria-hidden="true" />
      {children}
    </span>
  );
}
