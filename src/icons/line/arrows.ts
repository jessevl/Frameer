/**
 * @file arrows.ts
 * @description Drift line drawings that point or turn: chevrons and arrows (one drawing each, turned for the four directions, so they nudge the way they point), corners, resize and fullscreen marks, undo and redo, restore, rotate, refresh, repeat, flips, zoom, sign out, compare and split. Each moving part carries a `go*` class (a nudge in its own direction, see styles/motion.css) or a turn (`cw`, `ccw`, `half`).
 * Used by: line.ts.
 */
import { C24, folderBack, FOLDER_FRONT, part, rr, type LineDef, type LineKit } from './kit.ts';

/** The drawing turned about the center: `go` inside then nudges along the turned direction. */
const turn = (deg: number, inner: string) => (deg ? `<g transform="rotate(${deg} 12 12)">${inner}</g>` : inner);

const chevron = (deg: number) => (h: LineKit) => turn(deg, h.i('M9.6 5.8 15.8 12l-6.2 6.2', h.sw + 0.2, 'go'));
const arrow = (deg: number) => (h: LineKit) => turn(deg, part('go', h.i('M4.5 12h14.5M13.6 6.6 19 12l-5.4 5.4', h.sw + 0.1)));
/** An arrow that stops at a bar (whites and blacks): pointing down at the bar, or turned up. */
const toBar = (deg: number) => (h: LineKit) => turn(deg, part('go-d', h.i('M12 3.5v11M7.8 10.6 12 14.8l4.2-4.2', h.sw + 0.1)) + `<path d="${rr(4.5, 18.2, 15, 2.6, 1.3)}" fill="currentColor"/>`);
/** Two mirrored halves either side of a dashed fold, which part on hover (flip horizontal, turned for vertical). */
const flip = (deg: number) => (h: LineKit) => turn(deg, `<path d="M12 3v18" stroke="currentColor" stroke-width="${h.sw * 0.8}" stroke-linecap="round" stroke-dasharray="1.4 2.6"/>`
  + h.g('M9.5 6.6v11.4H4.4a1 1 0 0 1-.9-1.5l4.7-10.3a.7.7 0 0 1 1.3.4Z', 'go-l')
  + `<g class="go"><path d="M14.5 6.6v11.4h5.1a1 1 0 0 0 .9-1.5l-4.7-10.3a.7.7 0 0 0-1.3.4Z" fill="${h.soft}" stroke="currentColor" stroke-width="${h.sw}" stroke-linejoin="round"/></g>`);
const lens = (h: LineKit, inner: string) => h.g(C24(10.5, 10.5, 6.5)) + h.i('M20 20l-4.6-4.6', 2.8) + inner;

export const ARROWS = {
  chevronright: { name: 'Next', draw: chevron(0) },
  chevrondown: { name: 'Open', draw: chevron(90) },
  chevronleft: { name: 'Back', draw: chevron(180) },
  chevronup: { name: 'Close up', draw: chevron(270) },
  // Two chevrons pointing apart (a column that widens).
  spread: { name: 'Widen', draw: (h) => turn(180, h.i('M15.4 7.4 20 12l-4.6 4.6', h.sw + 0.1, 'go')) + h.i('M15.4 7.4 20 12l-4.6 4.6', h.sw + 0.1, 'go') + `<circle cx="12" cy="12" r="1.3" fill="${h.mid}"/>` },
  dropdown: { name: 'Choose one', draw: (h) => h.g(C24(12, 12, 9)) + h.i('M8.4 10.6 12 14.2l3.6-3.6', h.sw + 0.1, 'go-d') },
  arrowright: { name: 'Forward', draw: arrow(0) },
  arrowdown: { name: 'Down', draw: arrow(90) },
  arrowleft: { name: 'Go back', draw: arrow(180) },
  arrowup: { name: 'Up', draw: arrow(270) },
  skip: { name: 'Skip', draw: (h) => part('go', h.g('M5 6a1.5 1.5 0 0 1 2.4-1.2l8 6a1.5 1.5 0 0 1 0 2.4l-8 6A1.5 1.5 0 0 1 5 18Z')) + `<path d="${rr(16.8, 4.5, 3, 15, 1.5)}" fill="currentColor"/>` },
  todown: { name: 'Down to the end', draw: toBar(0) },
  toup: { name: 'Up to the end', draw: toBar(180) },
  enter: { name: 'Enter', draw: (h) => `<path d="${rr(3, 4, 18, 16, 4)}" fill="${h.faint}"/>` + h.i('M17.5 7.5v3.6a2.6 2.6 0 0 1-2.6 2.6H7') + part('go-l', h.i('M10 10.6 6.8 13.7l3.2 3.1')) },
  subitem: { name: 'Insert below', draw: (h) => h.i('M5.5 4.5v7.2a2.8 2.8 0 0 0 2.8 2.8H19') + part('go', h.i('M15.2 10.8l3.8 3.7-3.8 3.7')) + `<circle cx="5.5" cy="4.5" r="1.6" fill="currentColor"/>` },
  insertabove: { name: 'Insert above', draw: (h) => h.i('M5.5 19.5v-7.2a2.8 2.8 0 0 1 2.8-2.8H19') + part('go', h.i('M15.2 5.8l3.8 3.7-3.8 3.7')) + `<circle cx="5.5" cy="19.5" r="1.6" fill="currentColor"/>` },
  widen: { name: 'Width', draw: (h) => h.i('M4 12h16', h.sw * 0.9) + h.i('M7.4 8.4 3.8 12l3.6 3.6', h.sw + 0.1, 'go-l') + h.i('M16.6 8.4l3.6 3.6-3.6 3.6', h.sw + 0.1, 'go') + h.i('M12 5v2.4M12 16.6V19', h.sw * 0.8) },
  resize: { name: 'Resize', draw: (h) => h.i('M6.2 17.8 17.8 6.2', h.sw * 0.9) + h.i('M5 12.6V19h6.4', h.sw + 0.1, 'go-dl') + h.i('M12.6 5H19v6.4', h.sw + 0.1, 'go-ur') },
  fullscreen: { name: 'Full screen', draw: (h) => `<path d="${rr(7.5, 7.5, 9, 9, 2.4)}" fill="${h.faint}"/>` + h.i('M3.8 9V6.3a2.5 2.5 0 0 1 2.5-2.5H9', h.sw, 'go-ul') + h.i('M15 3.8h2.7a2.5 2.5 0 0 1 2.5 2.5V9', h.sw, 'go-ur') + h.i('M20.2 15v2.7a2.5 2.5 0 0 1-2.5 2.5H15', h.sw, 'go-dr') + h.i('M9 20.2H6.3a2.5 2.5 0 0 1-2.5-2.5V15', h.sw, 'go-dl') },
  expand: { name: 'Expand', draw: (h) => `<path d="${rr(6, 6, 12, 12, 3)}" fill="${h.faint}"/>` + part('go-ur', h.i('M14 4h6v6M20 4l-6.2 6.2')) + part('go-dl', h.i('M10 20H4v-6M4 20l6.2-6.2')) },
  shrink: { name: 'Shrink', draw: (h) => `<path d="${rr(8, 8, 8, 8, 2.4)}" fill="${h.faint}"/>` + part('go-dl', h.i('M14 4.5V10h5.5M14 10l6-6')) + part('go-ur', h.i('M10 19.5V14H4.5M10 14l-6 6')) },
  undo: { name: 'Undo', draw: (h) => part('ccw', h.i('M4.8 9.4h9.4a5.2 5.2 0 0 1 0 10.4H10') + h.i('M8.6 5.4 4.6 9.4l4 4')) },
  redo: { name: 'Redo', draw: (h) => part('cw', h.i('M19.2 9.4H9.8a5.2 5.2 0 0 0 0 10.4H14') + h.i('M15.4 5.4l4 4-4 4')) },
  restore: { name: 'Restore', draw: (h) => `<path d="${C24(12, 12, 7.6)}" fill="${h.faint}"/>` + part('ccw', h.i('M4.4 12a7.6 7.6 0 1 0 2.3-5.4L4.4 8.8') + h.i('M4.4 4.4v4.4h4.4')) },
  rotate: { name: 'Rotate', draw: (h) => `<path d="${C24(12, 12, 7.6)}" fill="${h.faint}"/>` + part('cw', h.i('M19.6 12a7.6 7.6 0 1 1-2.3-5.4l2.3 2.2') + h.i('M19.6 4.4v4.4h-4.4')) },
  refresh: { name: 'Refresh', draw: (h) => part('half', h.i('M4.6 11a7.5 7.5 0 0 1 13.3-4.4l1.7 1.8M19.6 4.2v4.2h-4.2') + h.i('M19.4 13a7.5 7.5 0 0 1-13.3 4.4l-1.7-1.8M4.4 19.8v-4.2h4.2')) },
  repeat: { name: 'Repeat', draw: (h) => h.i('M4.5 12.5V10a3 3 0 0 1 3-3h12') + part('go', h.i('M16.4 3.9 19.5 7l-3.1 3.1')) + h.i('M19.5 11.5V14a3 3 0 0 1-3 3h-12') + part('go-l', h.i('M7.6 20.1 4.5 17l3.1-3.1')) },
  fliph: { name: 'Flip horizontally', draw: flip(0) },
  flipv: { name: 'Flip vertically', draw: flip(90) },
  zoomin: { name: 'Zoom in', draw: (h) => lens(h, part('grow', h.i('M10.5 7.8v5.4M7.8 10.5h5.4'))) },
  zoomout: { name: 'Zoom out', draw: (h) => lens(h, part('grow', h.i('M7.8 10.5h5.4'))) },
  searchx: { name: 'Nothing found', draw: (h) => lens(h, part('twist', h.i('M8.6 8.6l3.8 3.8M12.4 8.6l-3.8 3.8'))) },
  logout: { name: 'Sign out', draw: (h) => h.g(rr(3.5, 3.5, 10, 17, 3)) + `<path d="${rr(5.8, 5.8, 5.4, 12.4, 1.6)}" fill="${h.soft}"/>` + part('go', h.i('M9.5 12H20.5M17 8.5l3.5 3.5-3.5 3.5')) },
  folderup: { name: 'Upload a folder', draw: (h) => folderBack(h) + h.g(FOLDER_FRONT, 'front') + part('go-u', h.i('M12 17.6v-5.2M9.6 14.6 12 12.2l2.4 2.4')) },
  shareout: { name: 'Share sheet', draw: (h) => h.back(rr(4.5, 9, 15, 12, 3)) + h.i('M8.5 9H7.5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3h-1') + part('go-u', h.i('M12 14.5V3M8.6 6.4 12 3l3.4 3.4')) },
  compare: { name: 'Compare', draw: (h) => h.i('M6 8.6v6.4a3 3 0 0 0 3 3h3.6') + part('go', h.i('M10.6 15.6 13 18l-2.4 2.4')) + h.i('M18 15.4V9a3 3 0 0 0-3-3h-3.6') + part('go-l', h.i('M13.4 8.4 11 6l2.4-2.4')) + h.g(C24(6, 6, 2.6), 'n1') + h.g(C24(18, 18, 2.6), 'n3') },
  ungroup: { name: 'Ungroup', draw: (h) => h.g(rr(3, 3, 11, 9, 2.6), 'go-ul') + h.g(rr(10, 12, 11, 9, 2.6), 'go-dr') + `<path d="${rr(5.4, 5.4, 4, 1.8, 0.9)}" fill="currentColor"/>` },
  split: { name: 'Side by side', draw: (h) => h.g(rr(3, 4, 18, 16, 3.2)) + `<path class="pane" d="${rr(5.3, 6.3, 5.4, 11.4, 1.5)}" fill="${h.soft}"/>` + h.i('M12 2.5v19', h.sw, 'go') },
} satisfies Record<string, LineDef>;
