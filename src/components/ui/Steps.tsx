/**
 * @file Steps.tsx
 * @description Numbered steps down a line: each has a 28 px circle (done: green with a check; current: coral ring with its number; to do: hairline ring with its number), a 2 px line to the next (green after a done step), a plain title and its content. The current step carries aria-current="step".
 * Used by: multi-step flows (setup, restore, first run).
 */
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

export type StepState = 'done' | 'current' | 'todo';

interface StepProps {
  state: StepState;
  title: ReactNode;
  children?: ReactNode;
  /** Set by Steps: the step's number, from 1. */
  n?: number;
}

export function Step({ state, title, children, n = 1 }: StepProps) {
  return (
    <li className="fr-step" data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
      <div className="fr-step-rail">
        <i aria-hidden="true">
          {state === 'done' ? (
            <svg viewBox="0 0 24 24">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          ) : (
            n
          )}
        </i>
        <u aria-hidden="true" />
      </div>
      <div className="fr-step-body">
        <p className="fr-step-title">
          {state === 'done' ? <span className="sr-only">Done: </span> : null}
          {title}
        </p>
        {children}
      </div>
    </li>
  );
}

export function Steps({ children, label }: { children: ReactNode; label?: string }) {
  const steps = Children.toArray(children).filter((c): c is ReactElement<StepProps> => isValidElement(c));
  return (
    <ol className="fr-steps" aria-label={label}>
      {steps.map((step, i) => cloneElement(step, { n: i + 1 }))}
    </ol>
  );
}
