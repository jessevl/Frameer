/**
 * @file DotMeter.tsx
 * @description A share as 20 dots (2 rows of 10, filled column by column) in each segment's colour, the rest in the hairline tone. Every segment with a value gets at least one dot; `dotCells` is the pure part. Decoration: say the numbers in words beside it.
 * Used by: FreePill.
 */
import { dotCells, type DotSegment } from './dotCells';
import type { MeterLevel } from './meter';

export type { DotSegment };

export function DotMeter({ segments, total, level }: { segments: readonly DotSegment[]; total: number; level?: MeterLevel }) {
  return (
    <span className="fr-dots" aria-hidden="true" data-level={level}>
      {dotCells(segments, total).map((color, i) => (
        <i key={i} style={color ? { background: color } : undefined} data-filled={color ? 'true' : 'false'} />
      ))}
    </span>
  );
}
