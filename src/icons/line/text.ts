/**
 * @file text.ts
 * @description Drift line drawings of writing and formatting: bold, italic, underline, strikethrough, heading, quote, code, hash, highlighter, the three alignments and the two spacings, bulleted, numbered and checked lists, add to list, indent and outdent, clear formatting, contents, the menu, sum, formula, microphone, attachment and keyboard. Lines slide in (`r1` to `r3`), marks draw themselves (`ink`), letters lean or grow.
 * Used by: line.ts.
 */
import { dot, ink, part, rr, type LineDef, type LineKit } from './kit.ts';

/** Four lines of text set to one side: `x` gives each line's start and end. */
const lines = (h: LineKit, rows: [number, number][]) => rows.map(([a, b], i) => h.i(`M${a} ${5.5 + i * 4.4}H${b}`, h.sw, ['r1', 'r2', 'r3', 'r3'][i])).join('');
/** Three rows: a marker on the left and a line of text. */
const rows = (h: LineKit, marker: (y: number, i: number) => string, end = [20, 18, 15]) => [6.5, 12, 17.5].map((y, i) => part(`r${i + 1}`, marker(y, i) + h.i(`M10 ${y}H${end[i]}`))).join('');
/** The spacing mark: two edges and two blocks pushed against them (horizontal, turned for vertical). */
const spacing = (deg: number) => (h: LineKit) => `<g${deg ? ` transform="rotate(${deg} 12 12)"` : ''}>${h.i('M3.5 3.5v17M20.5 3.5v17')}${h.g(rr(7, 6.5, 3.6, 11, 1.5), 'go-l')}${h.g(rr(13.4, 8.5, 3.6, 7, 1.5), 'go')}</g>`;
const indent = (h: LineKit, inward: boolean) => h.i('M11 6h9.5', h.sw, 'r1') + h.i('M11 12h9.5', h.sw, 'r2') + h.i('M11 18h9.5', h.sw, 'r3') + (inward ? part('go', h.i('M4 8.6 7.4 12 4 15.4')) : part('go-l', h.i('M7.4 8.6 4 12l3.4 3.4')));

export const TEXT = {
  bold: { name: 'Bold', draw: (h) => part('grow', h.back('M7 4.5h5.6a3.6 3.6 0 0 1 0 7.2H7ZM7 11.7h6.4a3.9 3.9 0 0 1 0 7.8H7Z') + h.i('M7 4.5h5.6a3.6 3.6 0 0 1 0 7.2H7ZM7 11.7h6.4a3.9 3.9 0 0 1 0 7.8H7Z', h.sw + 0.6)) },
  italic: { name: 'Italic', draw: (h) => part('lean', h.i('M10.5 4.5H18M6 19.5h7.5M14.4 4.5 9.6 19.5')) },
  underline: { name: 'Underline', draw: (h) => h.i('M7 4v6.6a5 5 0 0 0 10 0V4') + ink(h, 'M5.5 20.2h13') },
  strike: { name: 'Strikethrough', draw: (h) => h.i('M16.4 7.2A4.3 4.3 0 0 0 12.6 5H11.4a3.5 3.5 0 0 0-1.5 6.7M14.6 13.2A3.4 3.4 0 0 1 12.8 19.5h-1.6A4.4 4.4 0 0 1 7.2 17') + ink(h, 'M4.5 12h15', h.sw + 0.1) },
  heading: { name: 'Heading', draw: (h) => part('lift', h.i('M6 4.5v15M15 4.5v15M6 12h9')) + `<path class="day" d="${rr(17.6, 15.6, 3.2, 3.9, 1.2)}" fill="currentColor"/>` },
  quote: { name: 'Quote', draw: (h) => [3.5, 13.5].map((x, i) => part(`d${i + 1}`, h.g(rr(x, 10, 7, 7.5, 2.4)) + h.i(`M${x} 13.4c0-4.4 1.4-7.2 4.6-8.8`))).join('') },
  code: { name: 'Code', draw: (h) => h.i('M8 7 3.4 12 8 17', h.sw + 0.1, 'go-l') + h.i('M16 7l4.6 5-4.6 5', h.sw + 0.1, 'go') + h.i('M13.6 5 10.4 19', h.sw * 0.9, 'lean') },
  hash: { name: 'Number', draw: (h) => part('lean', h.i('M9.8 4 8 20M16.2 4l-1.8 16M4.5 9h15.5M4 15h15.5')) },
  highlight: { name: 'Highlight', draw: (h) => `<path class="jl" d="${rr(3, 19.4, 10.5, 2.4, 1.2)}" fill="${h.mid}"/>` + `<g transform="rotate(42 13 10)">${part('pen', h.g(rr(10.2, 0.8, 5.6, 12, 2.2)) + h.g('M10.4 13.8h5.2l-1.2 3.6h-2.8Z') + `<path d="${rr(10.2, 11.4, 5.6, 2.6, 1)}" fill="currentColor"/>`)}</g>` },
  alignleft: { name: 'Align left', draw: (h) => lines(h, [[4, 20], [4, 14], [4, 20], [4, 11]]) },
  aligncenter: { name: 'Center', draw: (h) => lines(h, [[4, 20], [7, 17], [4, 20], [8, 16]]) },
  alignright: { name: 'Align right', draw: (h) => lines(h, [[4, 20], [10, 20], [4, 20], [13, 20]]) },
  spacex: { name: 'Spread across', draw: spacing(0) },
  spacey: { name: 'Spread down', draw: spacing(90) },
  bullets: { name: 'Bulleted list', draw: (h) => rows(h, (y) => dot(5.4, y, 1.6)) },
  numbered: { name: 'Numbered list', draw: (h) => rows(h, (_, i) => h.i(['M4.6 5.2l1.3-.9v4.4', 'M4.2 11a1.4 1.4 0 0 1 2.7.5c0 .9-2.7 2-2.7 2.8h2.9', 'M4.3 15.9h2.5l-1.3 1.6a1.3 1.3 0 1 1-1.2 2.1'][i] ?? '', h.sw * 0.8)) },
  listchecks: { name: 'Checklist', draw: (h) => part('r1', ink(h, 'M3.6 6.4l1.8 1.8 3.2-3.6') + h.i('M12 6.5h8.5')) + part('r2', h.i('M12 12h8.5')) + part('r3', ink(h, 'M3.6 17.4l1.8 1.8 3.2-3.6', h.sw, 'ink2') + h.i('M12 17.5h6')) },
  listplus: { name: 'Add to the list', draw: (h) => h.i('M4 6.5h14', h.sw, 'r1') + h.i('M4 12h10', h.sw, 'r2') + h.i('M4 17.5h6', h.sw, 'r3') + part('grow', h.i('M17.5 13.5v7M14 17h7')) },
  indent: { name: 'Indent', draw: (h) => indent(h, true) },
  outdent: { name: 'Outdent', draw: (h) => indent(h, false) },
  clearformat: { name: 'Clear formatting', draw: (h) => part('lean', h.i('M4 6.5v-2h11v2M9.5 4.5v15M7 19.5h5')) + part('twist', h.i('M15.6 14.6l4.6 4.6M20.2 14.6l-4.6 4.6')) },
  toc: { name: 'Contents', draw: (h) => h.i('M4 5h16', h.sw, 'r1') + h.i('M5.6 5v11.6a1.8 1.8 0 0 0 1.8 1.8H9.6M5.6 10.4a1.6 1.6 0 0 0 1.6 1.6H9.6', h.sw * 0.9) + h.i('M13 12h7', h.sw, 'r2') + h.i('M13 18.4h5.5', h.sw, 'r3') },
  menu: { name: 'Menu', draw: (h) => h.i('M4 6.5h16', h.sw, 'r1') + h.i('M4 12h12', h.sw, 'r2') + h.i('M4 17.5h16', h.sw, 'r3') },
  sigma: { name: 'Sum', draw: (h) => part('grow', h.i('M17.6 6.6V4.5H6.2l6.2 7.5-6.2 7.5h11.4v-2.1')) },
  formula: { name: 'Formula', draw: (h) => h.g(rr(3.5, 3.5, 17, 17, 4.2)) + part('lean', h.i('M14.6 7.4h-.8a2.2 2.2 0 0 0-2.2 2.2v5.2a2.2 2.2 0 0 1-2.2 2.2h-.8M9 11.6h5.2', h.sw * 0.95)) },
  mic: { name: 'Microphone', draw: (h) => h.i('M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3.5M9 21h6') + part('bounce', h.g(rr(8.6, 2.8, 6.8, 11.6, 3.4)) + h.i('M10.6 7h2.8M10.6 10h2.8', h.sw * 0.8)) },
  attach: { name: 'Attachment', draw: (h) => part('swing', h.i('M19.4 11.6 12.2 18.8a4.6 4.6 0 0 1-6.5-6.5l7.7-7.7a3 3 0 0 1 4.3 4.3l-7.5 7.5a1.4 1.4 0 0 1-2-2l6.7-6.7')) },
  keyboard: { name: 'Keyboard', draw: (h) => h.g(rr(2.5, 5.5, 19, 13, 3.2)) + [6.4, 9.5, 12.6, 15.7].map((x, i) => dot(x, 9.4, 1, `d${(i % 3) + 1}`) + dot(x + 1.55, 12.2, 1, `d${((i + 1) % 3) + 1}`)).join('') + h.i('M8.6 15.4h6.8', h.sw, 'press') },
} satisfies Record<string, LineDef>;
