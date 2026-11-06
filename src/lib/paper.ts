/**
 * @file paper.ts
 * @description Paper and a breath of light (D15 D): one fine grain on the app's paper surfaces, and a wash from the sun's side far fainter than a light effect. By day the paper warms a little toward the window and settles a little on the far side, more so toward morning and evening; after dark it takes a cool hint. There is no sun spot. The grain is soft wrapping noise in two sizes for the paper's formation and a fine tooth on top, half softened so it reads as fibre rather than static; the grain ships as static PNG tiles (`styles/grain/`, made from `grain.ts`) so nothing is made at start, and the wash follows the hour. `paper.css` lays both behind the content, so type and pictures stay clean.
 * Based on drift@d91d6950:frontend/src/lib/paper.ts (the Cosy Drift exploration D15 D).
 *
 * Used by: the app shell (`usePaper`, which now sets only the wash).
 */
import { useEffect } from 'react';
import { sunAt } from '@frameer/clay/clay';

export { GRAIN_SIZE, grainField, grainPixels } from './grain';

type Rgba = readonly [number, number, number, number];
const rgba = (c: Rgba) => `rgba(${c.join(',')})`;
const blend = (a: readonly number[], b: readonly number[], k: number) => a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * k));

/** The wash for an hour, for light and for dark paper: a CSS gradient each. */
export function paperWash(hour: number): { light: string; dark: string } {
  const sun = sunAt(hour);
  const warmth = sun.up ? Math.max(0, Math.min(1, 1 - sun.elev * 1.6)) : 0;
  const wash = (dark: boolean): string => {
    const k = dark ? 0.5 : 1;
    if (!sun.up) {
      const night: Rgba = [92, 104, 150, +(0.026 * k).toFixed(3)];
      return `linear-gradient(${rgba(night)}, ${rgba(night)})`;
    }
    // From the sun's side: the left in the morning, overhead at noon, the right in the evening.
    const deg = 90 + 180 * sun.f;
    const tint = blend([255, 244, 228], [255, 214, 166], warmth);
    const warm: Rgba = [tint[0] ?? 255, tint[1] ?? 244, tint[2] ?? 228, +((0.014 + 0.03 * warmth) * k).toFixed(3)];
    const shade: Rgba = [84, 70, 60, +(dark ? 0 : 0.005 + 0.014 * warmth).toFixed(3)];
    return `linear-gradient(${deg.toFixed(0)}deg, ${rgba(warm)} 0, rgba(${tint.join(',')},0) 62%, ${rgba(shade)} 100%)`;
  };
  return { light: wash(false), dark: wash(true) };
}

const hourNow = () => {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
};

/** Puts the hour's wash on the document as CSS variables (see paper.css) and keeps it in step with the hour. The grain needs no code: `paper.css` references the shipped PNG tiles. */
export function usePaper(): void {
  useEffect(() => {
    const root = document.documentElement.style;
    const setWash = () => {
      const wash = paperWash(hourNow());
      root.setProperty('--paper-wash', wash.light);
      root.setProperty('--paper-wash-dark', wash.dark);
    };
    setWash();
    const timer = window.setInterval(setWash, 60_000);
    return () => window.clearInterval(timer);
  }, []);
}
