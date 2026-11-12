/**
 * @file marks.ts
 * @description Drift line drawings of marks and states: check (it draws itself), close (a small twist), plus and minus (they grow), the check box and ring, alerts and warnings (they shake), the loader arc, lock, shield, crown, key, hidden, bug, no connection, and the plain shapes (circle, dot, dashed ring, square, diamond, triangle).
 * Used by: line.ts.
 */
import { C24, dot, ink, part, rr, type LineDef, type LineKit } from './kit.ts';

/** A slash with a band of the surface color under it, so it cuts the drawing it crosses. */
const slash = (h: LineKit, d: string) => `<path d="${d}" fill="none" style="stroke:var(--icon-bg, var(--paper))" stroke-width="${h.sw + 2.6}" stroke-linecap="round"/>` + ink(h, d, h.sw + 0.1);
const TRI = 'M10.3 4.4a2 2 0 0 1 3.4 0l7.5 13.2a2 2 0 0 1-1.7 3H4.5a2 2 0 0 1-1.7-3Z';
const EYE = 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z';
const SHIELD = 'M12 2.8 19.2 5.6v5.8c0 4.4-2.9 7.8-7.2 9.8-4.3-2-7.2-5.4-7.2-9.8V5.6Z';

export const MARKS = {
  check: { name: 'Done', draw: (h) => ink(h, 'M5 12.6l4.4 4.4L19 7.4', h.sw + 0.2) },
  checkdouble: { name: 'All done', draw: (h) => ink(h, 'M2.8 12.8l4 4L15.2 8.4', h.sw + 0.1) + ink(h, 'M12.4 15.6l1.2 1.2L21.4 9', h.sw + 0.1, 'ink2') },
  checkcircle: { name: 'Succeeded', draw: (h) => h.g(C24(12, 12, 9)) + ink(h, 'M8 12.4l2.8 2.8 5.2-5.6', h.sw + 0.2) },
  checkbox: { name: 'Checked', draw: (h) => h.g(rr(3.5, 3.5, 17, 17, 4.2)) + ink(h, 'M8 12.2l2.8 2.8 5.2-5.6', h.sw + 0.2) },
  close: { name: 'Close', draw: (h) => part('twist', h.i('M6.5 6.5l11 11M17.5 6.5l-11 11', h.sw + 0.1)) },
  plus: { name: 'Add', draw: (h) => part('grow', h.i('M12 5v14M5 12h14', h.sw + 0.1)) },
  plusbox: { name: 'Add an entry', draw: (h) => h.g(rr(3.5, 3.5, 17, 17, 4.2)) + part('grow', h.i('M12 8v8M8 12h8')) },
  minus: { name: 'Remove', draw: (h) => h.i('M5 12h14', h.sw + 0.1, 'grow') },
  alert: { name: 'Problem', draw: (h) => h.g(C24(12, 12, 9)) + part('shake', h.i('M12 7.6v5.2', h.sw + 0.2) + dot(12, 16.3, 1.25)) },
  warning: { name: 'Warning', draw: (h) => h.g(TRI) + part('shake', h.i('M12 9.4v4.2', h.sw + 0.2) + dot(12, 16.8, 1.2)) },
  // The busy arc: callers spin it (`animate-spin`) while they wait.
  loader: { name: 'Loading', draw: (h) => `<circle cx="12" cy="12" r="8" fill="none" stroke="${h.soft}" stroke-width="${h.sw}"/>` + h.i('M12 4a8 8 0 0 1 8 8', h.sw + 0.4) },
  lock: { name: 'Locked', draw: (h) => h.i('M8 10.5V8a4 4 0 0 1 8 0v2.5', h.sw, 'lift') + h.g(rr(4.5, 10.5, 15, 10.5, 3.2)) + dot(12, 15.4, 1.5) + `<path d="M12 15.4v2.4" stroke="currentColor" stroke-width="${h.sw}" stroke-linecap="round"/>` },
  shield: { name: 'Admin', draw: (h) => h.g(SHIELD) + ink(h, 'M8.8 12.1l2.3 2.3 4.2-4.6', h.sw + 0.1) },
  crown: { name: 'Owner', draw: (h) => part('bounce', h.g('M3.6 8.4l4.2 3.8L12 5.2l4.2 7 4.2-3.8-1.6 9.4H5.2Z') + dot(12, 5.2, 1.3) + dot(3.6, 8.4, 1.1) + dot(20.4, 8.4, 1.1)) + h.i('M5.6 20.6h12.8') },
  key: { name: 'Password', draw: (h) => part('cw', h.i('M11.2 12.8 4.2 19.8M6.6 17.4l2.2 2.2M8.6 15.4l1.8 1.8') + h.g(C24(15, 9, 5.2)) + dot(16.4, 7.6, 1.4)) },
  hidden: { name: 'Hidden', draw: (h) => h.g(EYE) + `<circle cx="12" cy="12" r="3.3" fill="${h.mid}"/>` + slash(h, 'M4.5 4.5l15 15') },
  bug: { name: 'Bug', draw: (h) => part('shake', h.i('M3.6 10.4 7 12M3.4 15.2H7M4 20.2l3.4-2.4M20.4 10.4 17 12M20.6 15.2H17M20 20.2l-3.4-2.4', h.sw * 0.9)) + h.g(rr(7, 7.6, 10, 13.4, 5)) + h.g('M8.6 8.2a3.4 3.4 0 0 1 6.8 0Z') + h.i('M12 11.4v8', h.sw * 0.9) },
  wifioff: { name: 'Offline', draw: (h) => h.i('M2.6 9.2a13.6 13.6 0 0 1 18.8 0', h.sw, '', h.soft) + h.i('M5.6 12.6a9.2 9.2 0 0 1 12.8 0') + h.i('M8.8 16a4.6 4.6 0 0 1 6.4 0') + dot(12, 19.3, 1.4) + slash(h, 'M4 4l16 16') },
  circle: { name: 'Circle', draw: (h) => h.g(C24(12, 12, 8.5), 'grow') },
  radio: { name: 'One choice', draw: (h) => h.g(C24(12, 12, 9)) + dot(12, 12, 3.6, 'day') },
  dashed: { name: 'Spread', draw: (h) => `<path d="${C24(12, 12, 4.5)}" fill="${h.soft}"/><circle class="cw" cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="${h.sw}" stroke-linecap="round" stroke-dasharray="2.6 3.15"/>` },
  square: { name: 'Rectangle', draw: (h) => h.g(rr(4, 4, 16, 16, 3.6), 'grow') },
  diamond: { name: 'Diamond', draw: (h) => h.g('M10.6 3.8a2 2 0 0 1 2.8 0l6.8 6.8a2 2 0 0 1 0 2.8l-6.8 6.8a2 2 0 0 1-2.8 0l-6.8-6.8a2 2 0 0 1 0-2.8Z', 'cw') },
  triangle: { name: 'Sharpen', draw: (h) => h.g(TRI, 'grow') + `<path d="M12 7.6 17.2 16.8H6.8Z" fill="${h.soft}"/>` },
} satisfies Record<string, LineDef>;
