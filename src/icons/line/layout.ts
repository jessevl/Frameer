/**
 * @file layout.ts
 * @description Drift line drawings of layouts and charts: area, bar, column, line, pie and scatter charts (bars grow, lines draw, dots hop), columns, rows with a header row or column, the table, the fine grid, the page layout, the drag grips, the frame tool, crop, crosshair, vignette and film grain.
 * Used by: line.ts.
 */
import { C24, dot, ink, part, rr, type LineDef, type LineKit } from './kit.ts';

/** The chart axes: a left and a bottom edge joined by a soft corner. */
const axes = (h: LineKit) => h.i('M4 3.5V18a2.5 2.5 0 0 0 2.5 2.5H20.5', h.sw * 0.95);
const OVAL = 'M12 6.8c4.3 0 6.6 2.4 6.6 5.2s-2.3 5.2-6.6 5.2-6.6-2.4-6.6-5.2 2.3-5.2 6.6-5.2Z';
const FRAME = rr(3, 3.5, 18, 17, 3.2);
/** A table frame with one band filled: the header row, the header column or the alternating middle row. */
const band = (h: LineKit, d: string, cls: string, fill = 'currentColor') => h.g(FRAME) + `<path class="${cls}" d="${d}" fill="${fill}"/>`;
/** Six dots in two columns: the drag grip (turned for the horizontal one). */
const grip = (deg: number) => (h: LineKit) => `<g${deg ? ` transform="rotate(${deg} 12 12)"` : ''}>${[6, 12, 18].map((y, i) => part(`d${i + 1}`, dot(9, y, 1.6) + dot(15, y, 1.6))).join('')}</g>`;

export const LAYOUT = {
  chartarea: { name: 'Area chart', draw: (h) => axes(h) + `<path class="u1" d="M7.6 17V12.4l3.4-3.4 3 2.6 4.4-5.2V17Z" fill="${h.soft}"/>` + ink(h, 'M7.6 12.4 11 9l3 2.6 4.4-5.2') },
  chartbar: { name: 'Bar chart', draw: (h) => axes(h) + `<path class="r1" d="${rr(7.4, 5.4, 9.6, 2.8, 1.4)}" fill="currentColor"/><path class="r2" d="${rr(7.4, 10, 12.6, 2.8, 1.4)}" fill="${h.mid}"/><path class="r3" d="${rr(7.4, 14.6, 6.4, 2.8, 1.4)}" fill="${h.soft}"/>` },
  chartcolumn: { name: 'Column chart', draw: (h) => axes(h) + `<path class="u1" d="${rr(7.6, 10, 2.8, 7.4, 1.4)}" fill="currentColor"/><path class="u2" d="${rr(12, 5.6, 2.8, 11.8, 1.4)}" fill="${h.mid}"/><path class="u3" d="${rr(16.4, 12.4, 2.8, 5, 1.4)}" fill="${h.soft}"/>` },
  chartline: { name: 'Line chart', draw: (h) => axes(h) + ink(h, 'M7.6 15.2l3.4-4.6 3 2.6 4.6-6.2', h.sw + 0.1) + dot(18.6, 7, 1.6, 'dt') },
  chartpie: { name: 'Pie chart', draw: (h) => h.g(C24(11, 13, 8)) + h.i('M11 5v8h8', h.sw * 0.9) + `<g class="pull"><path d="M13.6 2.8a8 8 0 0 1 7.6 7.6h-7.6Z" fill="currentColor"/></g>` },
  chartscatter: { name: 'Scatter chart', draw: (h) => axes(h) + dot(9.2, 14.4, 1.6, 'd1') + dot(12.6, 9.8, 1.6, 'd2', h.mid) + dot(16.4, 12.4, 1.6, 'd3') + dot(18.4, 6.6, 1.6, 'd1', h.soft) + dot(13.4, 15.6, 1.3, 'd2', h.soft) },
  columns: { name: 'Columns', draw: (h) => h.g(FRAME) + h.i('M12 3.5v17', h.sw * 0.9) + `<path class="ca" d="${rr(5.4, 6, 4.4, 12, 1.4)}" fill="${h.soft}"/><path class="cb" d="${rr(14.2, 6, 4.4, 8, 1.4)}" fill="${h.soft}"/>` },
  columns3: { name: 'Three columns', draw: (h) => h.g(FRAME) + h.i('M9 3.5v17M15 3.5v17', h.sw * 0.9) + `<path class="u1" d="${rr(4.9, 6, 2.2, 11, 1.1)}" fill="${h.soft}"/><path class="u2" d="${rr(10.9, 6, 2.2, 7, 1.1)}" fill="${h.soft}"/><path class="u3" d="${rr(16.9, 6, 2.2, 9, 1.1)}" fill="${h.soft}"/>` },
  headerrow: { name: 'Header row', draw: (h) => band(h, 'M6.2 3.5h11.6a3.2 3.2 0 0 1 3.2 3.2V9.4H3V6.7a3.2 3.2 0 0 1 3.2-3.2Z', 'r1') + h.i('M3 15h18', h.sw * 0.9) },
  rows: { name: 'Banded rows', draw: (h) => band(h, 'M3 9.2h18v5.6H3Z', 'r2', h.soft) + h.i('M3 9.2h18M3 14.8h18', h.sw * 0.9) },
  headercol: { name: 'Header column', draw: (h) => band(h, 'M6.2 3.5H9.6v17H6.2A3.2 3.2 0 0 1 3 17.3V6.7a3.2 3.2 0 0 1 3.2-3.2Z', 'pane', h.mid) + h.i('M15.2 3.5v17', h.sw * 0.9) },
  table: { name: 'Table', draw: (h) => band(h, 'M6.2 3.5h11.6a3.2 3.2 0 0 1 3.2 3.2V9H3V6.7a3.2 3.2 0 0 1 3.2-3.2Z', 'r1', h.mid) + h.i('M3 9h18M3 14.8h18M10 9v11.5', h.sw * 0.9) },
  grid3: { name: 'Fine grid', draw: (h) => h.g(rr(3, 3, 18, 18, 3.4)) + h.i('M9 3v18M15 3v18M3 9h18M3 15h18', h.sw * 0.8) + `<path class="day" d="${rr(10.4, 10.4, 3.2, 3.2, 0.8)}" fill="currentColor"/>` },
  layout: { name: 'Layout', draw: (h) => h.g(rr(3, 3, 18, 7.4, 2.4), 'l1') + h.g(rr(3, 13.4, 8.6, 7.6, 2.4), 'q3') + h.g(rr(14.6, 13.4, 6.4, 7.6, 2.4), 'q4') + `<path d="${rr(5.4, 5.6, 6, 2.2, 1.1)}" fill="currentColor"/>` },
  grip: { name: 'Drag', draw: grip(0) },
  griph: { name: 'Drag across', draw: grip(90) },
  grain: { name: 'Grain', draw: (h) => [[5, 5, 1.5], [12, 4.6, 1.1], [19, 5.4, 1.4], [4.6, 12, 1.1], [12, 12, 1.7], [19.2, 12.2, 1.1], [5.2, 19, 1.4], [12.2, 19.2, 1.1], [18.8, 19, 1.6]].map(([x, y, r], i) => dot(x ?? 0, y ?? 0, r ?? 1, `d${(i % 3) + 1}`, i % 2 ? h.mid : 'currentColor')).join('') },
  frame: { name: 'Frame', draw: (h) => `<path class="grow" d="${rr(7, 7, 10, 10, 1.6)}" fill="${h.faint}"/>` + h.i('M7 3v18M17 3v18M3 7h18M3 17h18', h.sw * 0.95) },
  crop: { name: 'Crop', draw: (h) => `<path d="${rr(9, 9, 6, 6, 1)}" fill="${h.soft}"/>` + h.i('M6.5 3v12a2.5 2.5 0 0 0 2.5 2.5h12', h.sw, 'go-dl') + h.i('M17.5 21V9A2.5 2.5 0 0 0 15 6.5H3', h.sw, 'go-ur') },
  crosshair: { name: 'Pick a point', draw: (h) => h.g(C24(12, 12, 8)) + part('grow', h.i('M12 2.5v4.5M12 17v4.5M2.5 12H7M17 12h4.5')) + dot(12, 12, 1.6, 'day') },
  vignette: { name: 'Vignette', draw: (h) => `<path d="${rr(3, 4, 18, 16, 3.6)}${OVAL}" fill-rule="evenodd" fill="${h.mid}"/>` + h.i(OVAL, h.sw * 0.8, 'grow', h.soft) + h.i(rr(3, 4, 18, 16, 3.6)) },
} satisfies Record<string, LineDef>;
