/**
 * @file Spinner.tsx
 * @description A loading spinner in ink. Coral marks actions, the current item and selection, so a spinner that only says "wait" is never coral. `label` is its accessible name (a status region); without it the spinner is decorative and hidden from assistive technology.
 * Used by: apps' start-up and loading screens.
 */
import { ChromeIcon } from './ChromeIcons';

export interface SpinnerProps {
  /** Size in px. Default 28. */
  size?: number;
  /** Accessible name, e.g. "Starting Harbour". Left out, the spinner is decorative. */
  label?: string;
  className?: string;
}

export function Spinner({ size = 28, label, className = '' }: SpinnerProps) {
  const icon = <ChromeIcon name="loader" size={size} aria-hidden="true" className={`animate-spin text-[var(--ink-2)] motion-reduce:animate-none ${className}`} />;
  return label ? (
    <span role="status" aria-label={label} className="inline-flex">
      {icon}
    </span>
  ) : (
    icon
  );
}
