/**
 * @file meter.ts
 * @description The two small things the meter-like parts share: the level a reading is at (normal, watch, critical; callers decide the thresholds and put it on `data-level`) and a clamp for drawing a share.
 * Used by: FreePill, DotMeter, SegmentBar, TickGauge.
 */

export type MeterLevel = 'normal' | 'watch' | 'critical';

/** Clamps a share to 0-100 for drawing; NaN and infinities draw as 0. */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
