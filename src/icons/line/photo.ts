/**
 * @file photo.ts
 * @description Drift line drawings of the photo editor's tools and sliders: aperture (exposure), blend, drop and drops (saturation, tint), the tone curve, glow, the dim sun, moon and moon with a star, sun and moon, contrast, haze, sparkle (vibrance), rainbow (hue), ruler, balance, thermometer, waves, the magic wand, the brush and the live photo mark. Blades turn, drops hop, curves and waves draw themselves.
 * Used by: line.ts.
 */
import { C24, dot, ink, part, rr, type LineDef, type LineKit } from './kit.ts';

const round = (n: number) => Math.round(n * 100) / 100;

/** Six blades: from each corner of a small hexagon, a line on to the rim along the hexagon's next edge. */
const BLADES = (() => {
  const r = 3.6;
  const R = 9;
  const parts: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3 + Math.PI / 6;
    const b = ((k + 1) * Math.PI) / 3 + Math.PI / 6;
    const [x0, y0] = [12 + r * Math.cos(a), 12 + r * Math.sin(a)];
    const [dx, dy] = [Math.cos(b) - Math.cos(a), Math.sin(b) - Math.sin(a)].map((v) => v * r);
    const len = Math.hypot(dx ?? 0, dy ?? 0);
    const [ux, uy] = [(dx ?? 0) / len, (dy ?? 0) / len];
    // Where the ray from the corner meets the rim: solve |p + t u - c| = R.
    const px = x0 - 12;
    const py = y0 - 12;
    const bq = px * ux + py * uy;
    const t = -bq + Math.sqrt(bq * bq - (px * px + py * py - R * R));
    parts.push(`M${round(x0)} ${round(y0)}L${round(x0 + t * ux)} ${round(y0 + t * uy)}`);
  }
  return parts.join('');
})();

const DROP = 'M12 3c3 3.6 6.5 7.2 6.5 11a6.5 6.5 0 0 1-13 0C5.5 10.2 9 6.6 12 3Z';
const MOON = 'M19.6 14.4A8.2 8.2 0 1 1 9.6 4.4a6.6 6.6 0 0 0 10 10Z';
const STAR4 = (cx: number, cy: number, r: number) => `M${cx} ${cy - r}c${round(r * 0.18)} ${round(r * 0.6)} ${round(r * 0.4)} ${round(r * 0.82)} ${r} ${r}c${round(-r * 0.6)} ${round(r * 0.18)} ${round(-r * 0.82)} ${round(r * 0.4)} ${-r} ${r}c${round(-r * 0.18)} ${round(-r * 0.6)} ${round(-r * 0.4)} ${round(-r * 0.82)} ${-r} ${-r}c${round(r * 0.6)} ${round(-r * 0.18)} ${round(r * 0.82)} ${round(-r * 0.4)} ${r} ${-r}Z`;
const rays = (h: LineKit, r0: number, r1: number, n = 8) => Array.from({ length: n }, (_, k) => {
  const a = (k * 2 * Math.PI) / n;
  return `M${round(12 + r0 * Math.cos(a))} ${round(12 + r0 * Math.sin(a))}L${round(12 + r1 * Math.cos(a))} ${round(12 + r1 * Math.sin(a))}`;
}).join('');
const wave = (y: number) => `M3 ${y}c1.5-1.4 3-1.4 4.5 0s3 1.4 4.5 0 3-1.4 4.5 0 3 1.4 4.5 0`;

export const PHOTO = {
  aperture: { name: 'Exposure', draw: (h) => h.g(C24(12, 12, 9)) + `<path d="${C24(12, 12, 3.6)}" fill="${h.soft}"/>` + h.i(BLADES, h.sw * 0.85, 'cw vb') },
  blend: { name: 'Blend', draw: (h) => h.g(C24(9, 12, 6), 'go-l') + `<g class="go"><path d="${C24(15, 12, 6)}" fill="${h.soft}"/><path d="${C24(15, 12, 6)}" fill="none" stroke="currentColor" stroke-width="${h.sw}"/></g>` },
  droplet: { name: 'Saturation', draw: (h) => part('bounce', h.g(DROP) + h.i('M8.8 14.6a3.2 3.2 0 0 0 2.6 3.1', h.sw * 0.85)) },
  droplets: { name: 'Tint', draw: (h) => part('d2', h.g('M16.6 3c1.8 2.2 4 4.4 4 6.8a4 4 0 0 1-8 0c0-2.4 2.2-4.6 4-6.8Z')) + part('d1', h.g('M9 8c2.5 3 5.5 6 5.5 9a5.5 5.5 0 0 1-11 0c0-3 3-6 5.5-9Z')) },
  curve: { name: 'Curve', draw: (h) => h.g(rr(3, 3, 18, 18, 3.4)) + h.i('M3.5 20.5 20.5 3.5', 0.9, '', h.soft) + ink(h, 'M6 18C10.6 18 9.6 6 18 6', h.sw + 0.1) + h.g(C24(12, 12, 2), 'day') },
  halo: { name: 'Glow', draw: (h) => `<circle class="cw" cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="${h.sw}" stroke-linecap="round" stroke-dasharray="1.2 3"/>` + `<path d="${C24(12, 12, 6.2)}" fill="${h.faint}"/>` + h.g(C24(12, 12, 3.8), 'grow') },
  sundim: { name: 'Lights', draw: (h) => `<g class="rays vb">${Array.from({ length: 8 }, (_, k) => dot(round(12 + 8 * Math.cos((k * Math.PI) / 4)), round(12 + 8 * Math.sin((k * Math.PI) / 4)), 1.05)).join('')}</g>` + h.g(C24(12, 12, 4.4), '', true) },
  moon: { name: 'Shadows', draw: (h) => h.g(MOON, 'ccw') },
  moonstar: { name: 'Darks', draw: (h) => h.g(MOON, 'ccw') + `<path class="tw1" d="${STAR4(17.6, 5.4, 2.6)}" fill="currentColor"/>` },
  sunmoon: { name: 'Light and dark', draw: (h) => h.i(rays(h, 7.4, 9.4).split('M').filter((s, i) => i && [1, 2, 3, 7, 8].includes(i)).map((s) => `M${s}`).join(''), h.sw, 'tw1') + h.g(C24(12, 12, 5.2)) + '<path d="M12 6.8a5.2 5.2 0 0 0 0 10.4Z" fill="currentColor"/>' },
  contrast: { name: 'Contrast', draw: (h) => h.g(C24(12, 12, 9)) + '<g class="half"><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"/></g>' },
  haze: { name: 'Haze', draw: (h) => h.g('M7.2 15.2a4 4 0 0 1-.7-7.9 5.6 5.6 0 0 1 10.8 1.6 3.2 3.2 0 0 1-.3 6.3Z', 'lift') + h.i('M5.5 18.4h9', h.sw, 'r1') + h.i('M9 21h9.5', h.sw, 'r2') },
  sparkle: { name: 'Vibrance', draw: (h) => h.g(STAR4(12, 12, 8.6), 'spk') },
  rainbow: { name: 'Hue', draw: (h) => ink(h, 'M3 17a9 9 0 0 1 18 0') + `<path class="ink ink2" pathLength="10" d="M6.6 17a5.4 5.4 0 0 1 10.8 0" fill="none" stroke="${h.mid}" stroke-width="${h.sw + 0.5}" stroke-linecap="round"/>` + `<path d="M10.2 17a1.8 1.8 0 0 1 3.6 0" fill="none" stroke="${h.soft}" stroke-width="${h.sw}" stroke-linecap="round"/>` },
  ruler: { name: 'Straighten', draw: (h) => `<g transform="rotate(-35 12 12)"><g class="cw">${h.g(rr(1.6, 8.4, 20.8, 7.2, 1.8))}${h.i('M5.6 8.4v2.6M9 8.4v3.6M12.4 8.4v2.6M15.8 8.4v3.6M19.2 8.4v2.6', h.sw * 0.85)}</g></g>` },
  scale: { name: 'Balance', draw: (h) => h.i('M12 4v16M8 20.5h8') + `<g class="beam">${h.i('M4.6 7.4h14.8')}${h.g('M2.4 14.4 4.6 8.2l2.2 6.2a2.2 2.2 0 0 1-4.4 0Z')}${h.g('M17.2 14.4l2.2-6.2 2.2 6.2a2.2 2.2 0 0 1-4.4 0Z')}</g>` + dot(12, 4, 1.4) },
  thermometer: { name: 'Temperature', draw: (h) => h.g('M9.5 5a2.5 2.5 0 0 1 5 0v9.4a4.5 4.5 0 1 1-5 0Z') + h.i('M12 16.6V8.6', h.sw + 0.4, 'u1') + dot(12, 17.6, 2.2) + h.i('M17 6h2.4M17 9.4h2.4', h.sw * 0.8) },
  waves: { name: 'Waves', draw: (h) => ink(h, wave(9)) + ink(h, wave(15), h.sw, 'ink2') },
  wand: { name: 'Auto', draw: (h) => part('pen', h.i('M4 20 13.6 10.4', h.sw + 0.6) + `<path d="${STAR4(16.4, 7.6, 4)}" fill="${h.faint}" stroke="currentColor" stroke-width="${h.sw}" stroke-linejoin="round"/>`) + `<path class="tw1" d="${STAR4(6.4, 5, 2)}" fill="currentColor"/>` + dot(20.2, 14.6, 1.1, 'tw2') },
  live: { name: 'Live photo', draw: (h) => `<circle class="cw" cx="12" cy="12" r="9.4" fill="none" stroke="currentColor" stroke-width="${h.sw}" stroke-linecap="round" stroke-dasharray="0.1 2.95"/>` + h.g(C24(12, 12, 5.8)) + dot(12, 12, 2.5, 'day') },
  brush: { name: 'Brush', draw: (h) => `<g transform="rotate(45 12 12)">${part('pen', h.g(rr(10.4, 0.6, 3.2, 10.2, 1.6)) + h.g(rr(9.2, 10.4, 5.6, 2.8, 1)) + h.g('M9.4 13.2h5.2v2.2c0 2.8-1.1 5.2-2.6 6.8-1.5-1.6-2.6-4-2.6-6.8Z'))}</g>` + `<path class="jl" d="${rr(13.6, 19.4, 7.4, 2.2, 1.1)}" fill="${h.mid}"/>` },
} satisfies Record<string, LineDef>;
