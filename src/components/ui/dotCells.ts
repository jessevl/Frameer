/**
 * @file dotCells.ts
 * @description Which colour each of the dot meter's 20 dots shows: one dot per 5% of the total, at least one per segment with a value, the rest free (null). Pure, so the counts are tested without a DOM.
 * Used by: DotMeter.
 */

export const DOT_COUNT = 20;

export interface DotSegment {
  /** Any CSS colour or `var(...)`. */
  color: string;
  value: number;
}

export function dotCells(segments: readonly DotSegment[], total: number): (string | null)[] {
  const cells: (string | null)[] = [];
  for (const s of segments) {
    if (s.value <= 0 || total <= 0) continue;
    const n = Math.max(1, Math.round(((s.value / total) * 100) / 5));
    for (let i = 0; i < n; i++) cells.push(s.color);
  }
  const shown = cells.slice(0, DOT_COUNT);
  while (shown.length < DOT_COUNT) shown.push(null);
  return shown;
}
