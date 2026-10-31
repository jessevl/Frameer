/**
 * @file visitors.ts
 * @description Visitors that follow the season (D16 C): now and then something falls past a picture, a petal in spring, a seed in summer, a leaf in autumn, a few flakes in winter. One at a time, across about seven seconds, over pictures large enough to hold one; never with reduced motion. The seasons are the northern hemisphere's.
 * Used by: ClayCanvas.
 */
import { mix } from '../icons/palette';
import { hash, type ClayPalette } from './clay';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export function seasonOf(month: number): Season {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

/** How long a visitor takes to cross, and how long a picture waits between them (plus up to half again, per picture). */
export const VISIT_MS = 7000;
export const VISIT_EVERY_MS = 24000;

/** Whether a picture is large enough for a visitor. */
export const roomForVisitor = (w: number, h: number) => w >= 200 && h >= 110;

function leaf(c: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, fill: string, vein: string) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(rot * 1.7)));
  c.beginPath();
  c.moveTo(-r, 0);
  c.quadraticCurveTo(0, -r * 0.75, r, 0);
  c.quadraticCurveTo(0, r * 0.75, -r, 0);
  c.fillStyle = fill;
  c.fill();
  c.strokeStyle = vein;
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(-r * 0.8, 0);
  c.lineTo(r * 0.8, 0);
  c.stroke();
  c.restore();
}

/** Draws the visitor `p` of the way across (0 to 1) a w x h picture; `seed` keeps each picture's path its own. */
export function drawVisitor(c: CanvasRenderingContext2D, w: number, h: number, pal: ClayPalette, season: Season, p: number, seed: number): void {
  if (p <= 0 || p >= 1) return;
  const G = pal.g;
  c.save();
  c.globalAlpha = Math.min(1, p * 6, (1 - p) * 6);
  if (season === 'winter') {
    for (let i = 0; i < 4; i++) {
      const q = Math.max(0, Math.min(1, p * 1.3 - i * 0.1));
      const x = w * (0.2 + 0.2 * i + 0.05 * Math.sin(q * 8 + i));
      const y = -6 + q * (h + 12);
      c.beginPath();
      c.arc(x, y, 2 + (i % 2), 0, Math.PI * 2);
      c.fillStyle = pal.dark ? G[0] : '#FFFFFF';
      c.fill();
      c.strokeStyle = G[3];
      c.lineWidth = 0.8;
      c.stroke();
    }
  } else {
    const x0 = w * (0.25 + 0.5 * hash(seed));
    const x = x0 + Math.sin(p * 7) * w * 0.08 + p * w * 0.12;
    const y = -10 + p * h * 0.92;
    const rot = p * 9 + Math.sin(p * 7) * 0.8;
    if (season === 'spring') leaf(c, x, y, 5.5, rot, mix(pal.coralLight, '#FFFFFF', 0.45), pal.coralLight);
    else if (season === 'autumn') leaf(c, x, y, 7.5, rot, mix(pal.coral, G[4], 0.35), mix(pal.coral, G[6], 0.5));
    else leaf(c, x, y, 3.5, rot, G[1], G[4]);
  }
  c.restore();
}
