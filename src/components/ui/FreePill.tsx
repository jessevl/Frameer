/**
 * @file FreePill.tsx
 * @description A "free / size" pill: a dot meter, what is free in bold ink and the size in ink-3 ("2.7 TB free / 8 TB"). A `watch` level turns the border and the free text orange, `critical` red; say the same in words next to it, colour is never alone.
 * Used by: storage and quota readouts.
 */
import { DotMeter, type DotSegment } from './DotMeter';
import type { MeterLevel } from './meter';

export interface FreePillProps {
  segments: readonly DotSegment[];
  total: number;
  /** The free amount, formatted by the caller ("2.7 TB"). */
  free: string;
  /** The size, formatted by the caller ("8 TB"). */
  size: string;
  level?: MeterLevel;
  className?: string;
}

export function FreePill({ segments, total, free, size, level = 'normal', className = '' }: FreePillProps) {
  return (
    <span className={`fr-pill ${className}`} data-level={level}>
      <DotMeter segments={segments} total={total} level={level} />
      <span>
        <b>{free}</b> free <em>/ {size}</em>
      </span>
    </span>
  );
}
