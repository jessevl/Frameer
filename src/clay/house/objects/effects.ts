/**
 * @file effects.ts
 * @description Marks drawn after the light pass so they stay crisp at night: sound from a speaker, steam from a pan, a mug or a bath, and air drawn in or blown out.
 * Ported from hearth-concept/clay2/things-b.js (sound, steam, air).
 * Used by: media.ts, kitchen.ts, rooms.ts, utility.ts, outdoor.ts, wall.ts, the examples.
 */
import type { Stage } from '../stage';

/** Arcs of sound above (x, y, z). */
export function sound(st: Stage, x: number, y: number, z: number, k = 1): void {
  st.post.push((o) => {
    const [a, b] = st.P(x, y, z);
    o.save();
    o.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      o.beginPath();
      o.arc(a, b, (0.16 + i * 0.12) * st.s * k, -Math.PI * 0.42, -Math.PI * 0.08);
      o.strokeStyle = `rgba(244,150,130,${0.95 - i * 0.25})`;
      o.lineWidth = st.lw(1.5);
      o.stroke();
      o.beginPath();
      o.arc(a, b, (0.16 + i * 0.12) * st.s * k, -Math.PI * 0.92, -Math.PI * 0.58);
      o.stroke();
    }
    o.restore();
  });
}

/** n wisps of steam rising from (x, y, z). */
export function steam(st: Stage, x: number, y: number, z: number, k = 1, n = 3): void {
  st.post.push((o) => {
    const [a, b] = st.P(x, y, z);
    const s = st.s;
    o.save();
    o.lineCap = 'round';
    o.lineWidth = st.lw(1.6);
    for (let j = 0; j < n; j++) {
      o.beginPath();
      for (let i = 0; i < 9; i++) {
        const px = a + (j - (n - 1) / 2) * 0.09 * s * k + Math.sin(i * 0.9 + j * 2.1) * 0.035 * s * k;
        const py = b - i * 0.045 * s * k;
        if (i) o.lineTo(px, py);
        else o.moveTo(px, py);
      }
      o.strokeStyle = st.env.night ? `rgba(255,255,255,${0.5 - j * 0.08})` : `rgba(140,150,160,${0.55 - j * 0.08})`;
      o.stroke();
    }
    o.restore();
  });
}

/** Three strokes of moving air beside (x, y, z), toward the right (dir 1) or the left (-1). */
export function air(st: Stage, x: number, y: number, z: number, k = 1, dir = 1): void {
  st.post.push((o) => {
    const [a, b] = st.P(x, y, z);
    const s = st.s;
    o.save();
    o.lineCap = 'round';
    o.lineWidth = st.lw(1.4);
    for (let j = 0; j < 3; j++) {
      o.beginPath();
      const y0 = b - (j - 1) * 0.09 * s * k;
      o.moveTo(a + dir * 0.34 * s * k, y0);
      o.bezierCurveTo(a + dir * 0.22 * s * k, y0 - 0.06 * s * k, a + dir * 0.12 * s * k, y0 + 0.06 * s * k, a + dir * 0.03 * s * k, y0);
      o.strokeStyle = st.env.night ? `rgba(190,215,235,${0.75 - j * 0.12})` : `rgba(110,140,165,${0.7 - j * 0.12})`;
      o.stroke();
    }
    o.restore();
  });
}
