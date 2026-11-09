/**
 * @file tickScale.ts
 * @description The tick gauge's scale: 40 ticks, the hue of a position (green below 55%, orange to 75%, red above).
 * Used by: TickGauge.
 */

export const TICKS = 40;

export function tickHue(position: number): 'green' | 'orange' | 'red' {
  return position < 55 ? 'green' : position < 75 ? 'orange' : 'red';
}
