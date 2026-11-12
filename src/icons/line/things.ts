/**
 * @file things.ts
 * @description Drift line drawings of things: calendars with a check or a clock, bookmarks, the flag, files (plain, edited, new, sheet), new folder and folder tree, globe, mail, phone and smartphone, monitor, plug, music, film strip, slides, sticky note, timer, play and pause, sound on and off, picture in picture, the open book, people (one, two, checked, edited), databases, gauge, light bulb, pushpin, sliders, stamp, bandage and pipette, and the suite's chrome things (bell, box, send, wrap, USB, terminal, cloud, server).
 * Used by: line.ts.
 */
import { C24, calendarHead, dot, FOLDER_FRONT, folderBack, ink, part, rr, type LineDef, type LineKit } from './kit.ts';

const FILE = 'M8 2.6h5.8L19 7.8v10.6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5.6a3 3 0 0 1 3-3Z';
const file = (h: LineKit, inner = '', cls = '') => part(cls, h.g(FILE) + h.i('M13.8 2.9v3.3a1.6 1.6 0 0 0 1.6 1.6H19', h.sw * 0.9)) + inner;
const BOOKMARK = 'M6.5 5.2a2.6 2.6 0 0 1 2.6-2.6h5.8a2.6 2.6 0 0 1 2.6 2.6v15.6L12 17.2l-5.5 3.6Z';
/** A person a little to the left, leaving room for a mark at the right. */
const person = (h: LineKit) => h.g(C24(9, 8, 3.6), 'lift') + h.g('M2.8 20a6.2 6.2 0 0 1 12.4 0Z');
const SPEAKER = 'M3.5 9.6A1.6 1.6 0 0 1 5.1 8h2.5l4.4-3.6v15.2L7.6 16H5.1a1.6 1.6 0 0 1-1.6-1.6Z';
const DB = 'M4.5 6c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3v12c0 1.7-3.4 3-7.5 3s-7.5-1.3-7.5-3Z';
const db = (h: LineKit) => h.g(DB) + h.i('M4.5 6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3', h.sw, 'lift') + h.i('M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3', h.sw * 0.9);
/** A small folder for the tree. */
const twig = (h: LineKit, y: number, cls: string) => h.g(`M10.5 ${y + 1.4}a1.4 1.4 0 0 1 1.4-1.4h2.4l1.3 1.3h4.5a1.4 1.4 0 0 1 1.4 1.4v3.9a1.4 1.4 0 0 1-1.4 1.4h-8.2a1.4 1.4 0 0 1-1.4-1.4Z`, cls);

export const THINGS = {
  calcheck: { name: 'Planned', draw: (h) => calendarHead(h) + ink(h, 'M8.6 15.2l2.4 2.4 4.6-4.8', h.sw + 0.1) },
  calclock: { name: 'Schedule', draw: (h) => calendarHead(h) + `<circle cx="7.6" cy="14.2" r="1.15" fill="${h.soft}"/><circle cx="7.6" cy="17.6" r="1.15" fill="${h.soft}"/>` + part('day', h.g(C24(15.6, 16, 4.4)) + h.i('M15.6 14v2.2l1.4 1', h.sw * 0.9)) },
  bookmark: { name: 'Bookmark', draw: (h) => h.g(BOOKMARK, 'press') },
  bookmarkadd: { name: 'Save the view', draw: (h) => part('press', h.g(BOOKMARK) + h.i('M12 6.6v5.8M9.1 9.5h5.8', h.sw, 'grow')) },
  flag: { name: 'Priority', draw: (h) => h.i('M5.5 21V3.5') + h.g('M5.5 4.6c2.4-1.4 4.6-1.4 7 0s4.6 1.4 7 0v8.8c-2.4 1.4-4.6 1.4-7 0s-4.6-1.4-7 0Z', 'flap') },
  file: { name: 'File', draw: (h) => file(h, '', 'lift') },
  fileedit: { name: 'Edit the file', draw: (h) => file(h, h.i('M8.4 12.4h5M8.4 15.6h3', h.sw * 0.9)) + part('pen', h.g('M17.4 11.4a1.8 1.8 0 0 1 2.6 2.6l-5.2 5.2-3.3.8.8-3.3Z')) },
  filenew: { name: 'New file', draw: (h) => file(h, part('grow', h.i('M12 10.8v6.4M8.8 14h6.4'))) },
  sheet: { name: 'Spreadsheet', draw: (h) => file(h, `<path class="r1" d="${rr(8, 10.6, 8, 2.6, 0.8)}" fill="${h.mid}"/>` + h.i('M8 16.4h8M12 13.2V19', h.sw * 0.9)) },
  foldernew: { name: 'New folder', draw: (h) => folderBack(h) + h.g(FOLDER_FRONT, 'front') + part('grow', h.i('M12 12.2v5.6M9.2 15h5.6')) },
  foldertree: { name: 'Folders', draw: (h) => h.i('M5 3.5v13.6a1.8 1.8 0 0 0 1.8 1.8h3.4M5 7.3h5.2', h.sw * 0.9) + twig(h, 3.6, 'r1') + twig(h, 15.2, 'r2') + dot(5, 3.5, 1.5) },
  globe: { name: 'Web', draw: (h) => h.g(C24(12, 12, 9)) + h.i('M3.4 12h17.2M5 7.5h14M5 16.5h14', h.sw * 0.8) + h.i('M12 3c2.6 2.4 3.9 5.4 3.9 9s-1.3 6.6-3.9 9c-2.6-2.4-3.9-5.4-3.9-9S9.4 5.4 12 3Z', h.sw * 0.9, 'spinx') },
  mail: { name: 'Email', draw: (h) => part('bounce', h.g(rr(3, 5, 18, 14, 3.2)) + h.i('M4 7.4 12 13l8-5.6')) },
  phone: { name: 'Phone', draw: (h) => h.g('M8.2 3.5H5.9A2.4 2.4 0 0 0 3.5 6c.3 7.6 6.9 14.2 14.5 14.5a2.4 2.4 0 0 0 2.5-2.4v-2.3a1.6 1.6 0 0 0-1.2-1.5l-3.1-.8a1.6 1.6 0 0 0-1.6.5l-1 1.2a11.4 11.4 0 0 1-5.6-5.6l1.2-1a1.6 1.6 0 0 0 .5-1.6l-.8-3.1A1.6 1.6 0 0 0 8.2 3.5Z', 'ring') },
  smartphone: { name: 'Phone app', draw: (h) => part('lift', h.g(rr(6, 2.5, 12, 19, 3.2)) + `<path d="${rr(10.2, 4.6, 3.6, 1.4, 0.7)}" fill="currentColor"/>`) + dot(12, 18.2, 1.1, 'day') },
  monitor: { name: 'System', draw: (h) => h.i('M12 16.5v3.6M8 20.4h8') + part('lift', h.g(rr(2.5, 3.8, 19, 12.7, 3)) + `<path d="${rr(5, 6.3, 6, 2, 1)}" fill="${h.mid}"/>`) },
  plug: { name: 'Integrations', draw: (h) => h.i('M12 15.8V21') + part('go-u', h.i('M9 3v4M15 3v4') + h.g('M6.4 7h11.2v3.4a5.6 5.6 0 0 1-11.2 0Z')) },
  music: { name: 'Music', draw: (h) => h.i('M9 17.2V6.2l10.6-2.4v11.4') + h.i('M9 9.6l10.6-2.4', h.sw * 0.9) + h.g(C24(6.6, 17.2, 2.6), 'd1') + h.g(C24(17.2, 15.2, 2.6), 'd2') },
  film: { name: 'Film', draw: (h) => part('lift', h.g(rr(4, 2.5, 16, 19, 2.8)) + h.i('M8 2.5v19M16 2.5v19', h.sw * 0.9) + [5.8, 9.9, 14.1, 18.2].map((y) => dot(6, y, 0.85) + dot(18, y, 0.85)).join('') + `<path d="${rr(9.6, 8, 4.8, 8, 1.2)}" fill="${h.soft}"/>`) },
  slides: { name: 'Slides', draw: (h) => h.i('M12 15.6v2.8M8.4 21l3.6-2.6 3.6 2.6') + h.g(rr(3, 3.5, 18, 12, 2.6)) + ink(h, 'M7 11.6l3-3 2.4 2 4.4-4') },
  note: { name: 'Note', draw: (h) => part('tilt', h.g('M6 3.5h12A2.5 2.5 0 0 1 20.5 6v8.4l-6.1 6.1H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5Z') + h.g('M14.4 20.4v-4.4a1.6 1.6 0 0 1 1.6-1.6h4.4') + h.i('M7.4 8.4h9M7.4 11.8h5.6', h.sw * 0.9)) },
  timer: { name: 'Timer', draw: (h) => h.i('M10 2.6h4M12 2.6v2.6M18.6 6.4l1.2-1.2') + h.g(C24(12, 13, 8)) + h.i('M12 13V9', h.sw + 0.2, 'hand') + dot(12, 13, 1.2) },
  play: { name: 'Play', draw: (h) => h.g('M7 5.6a1.6 1.6 0 0 1 2.5-1.3l9.3 6.4a1.6 1.6 0 0 1 0 2.6l-9.3 6.4A1.6 1.6 0 0 1 7 18.4Z', 'go') },
  pause: { name: 'Pause', draw: (h) => part('press', h.g(rr(5.6, 4.5, 4.4, 15, 1.8)) + h.g(rr(14, 4.5, 4.4, 15, 1.8))) },
  sound: { name: 'Sound on', draw: (h) => h.g(SPEAKER) + h.i('M15.4 9a4.2 4.2 0 0 1 0 6', h.sw, 'tw1') + h.i('M18.2 6.2a8 8 0 0 1 0 11.6', h.sw, 'tw2') },
  mute: { name: 'Sound off', draw: (h) => h.g(SPEAKER) + part('twist', h.i('M15.6 9.6l4.8 4.8M20.4 9.6l-4.8 4.8')) },
  pip: { name: 'Picture in picture', draw: (h) => h.g(rr(2.5, 4, 19, 15, 3)) + `<g class="go-dr"><path d="${rr(11.6, 11, 7.4, 5.6, 1.6)}" fill="${h.mid}" stroke="currentColor" stroke-width="${h.sw}"/></g>` },
  book: { name: 'Book', draw: (h) => h.g('M12 6.4C10 5 7.6 4.4 3.5 4.4v13.8c4.1 0 6.5.6 8.5 2Z') + h.g('M12 6.4c2-1.4 4.4-2 8.5-2v13.8c-4.1 0-6.5.6-8.5 2Z', 'lift') + h.i('M15 8.6c1-.4 2.2-.6 3.4-.6M15 11.8c1-.4 2.2-.6 3.4-.6', h.sw * 0.8) },
  user: { name: 'Person', draw: (h) => h.g(C24(12, 8, 4), 'lift') + h.g('M4.5 20.5a7.5 7.5 0 0 1 15 0Z') },
  people: { name: 'People', draw: (h) => part('ca', h.g(C24(16.4, 8.2, 3.2)) + h.g('M12 19.6a5.2 5.2 0 0 1 9.8-2.4v2.4Z')) + part('cb', h.g(C24(8.6, 8.6, 3.7)) + h.g('M2.4 20.4a6.2 6.2 0 0 1 12.4 0Z')) },
  usercheck: { name: 'Assigned to', draw: (h) => person(h) + ink(h, 'M15.4 11.8l2 2 4.2-4.6', h.sw + 0.1) },
  useredit: { name: 'Edited by', draw: (h) => person(h) + part('pen', h.g('M18.4 10.8a1.7 1.7 0 0 1 2.4 2.4l-5 5-3 .8.8-3Z')) },
  database: { name: 'Database', draw: (h) => db(h) },
  dbzap: { name: 'Turn into a base', draw: (h) => `<g transform="translate(-2.2 0)">${db(h)}</g>` + part('bounce', h.g('M18.6 9.8 15.2 15.4h3.4l-1.2 4.8 4-6.2h-3.4l1.2-4.2Z')) },
  gauge: { name: 'Amount', draw: (h) => h.i('M4.2 17a8.6 8.6 0 1 1 15.6 0', h.sw) + `<path d="M5.8 15.6a6.6 6.6 0 0 1 3-8.3" fill="none" stroke="${h.soft}" stroke-width="${h.sw + 1}" stroke-linecap="round"/>` + h.i('M12 14.6l3.6-4.4', h.sw + 0.2, 'ndl') + dot(12, 14.6, 1.6) },
  idea: { name: 'Idea', draw: (h) => h.i('M9.6 19.4h4.8M10.6 22h2.8') + h.g('M12 3a6.4 6.4 0 0 0-3.7 11.6c.6.5.9 1.1.9 1.8v.6h5.6v-.6c0-.7.3-1.3.9-1.8A6.4 6.4 0 0 0 12 3Z', 'lift') + ink(h, 'M12 6.4a3 3 0 0 1 3 2.6', h.sw * 0.85) },
  pin: { name: 'Pin', draw: (h) => part('bounce', h.i('M12 15v6.4') + h.g('M8.6 3.4h6.8a1 1 0 0 1 .9 1.4l-1.3 3.4 2.6 3.2a1 1 0 0 1 .2.6v1.4a.6.6 0 0 1-.6.6H6.8a.6.6 0 0 1-.6-.6V12a1 1 0 0 1 .2-.6L9 8.2 7.7 4.8a1 1 0 0 1 .9-1.4Z')) },
  sliders: { name: 'Options', draw: (h) => h.i('M4 7.5h16M4 16.5h16', h.sw * 0.9) + h.g(C24(9, 7.5, 2.5), 'go') + h.g(C24(15, 16.5, 2.5), 'go-l') },
  stamp: { name: 'Clone', draw: (h) => part('press', h.g(C24(12, 5.6, 2.9)) + h.g('M10.4 8.4h3.2l.9 4.8h-5Z') + h.g(rr(4, 13.2, 16, 4.2, 1.6))) + ink(h, 'M5.5 20.8h13') },
  bandage: { name: 'Heal', draw: (h) => `<g transform="rotate(-45 12 12)"><g class="press">${h.g(rr(2.2, 8, 19.6, 8, 4))}<path d="${rr(8.6, 8, 6.8, 8, 0.5)}" fill="${h.soft}"/>${[[10.4, 10.6], [13.6, 10.6], [10.4, 13.4], [13.6, 13.4], [12, 12]].map(([x, y]) => dot(x ?? 0, y ?? 0, 0.75)).join('')}</g></g>` },
  pipette: { name: 'Pick a color', draw: (h) => `<g transform="rotate(45 12 12)">${part('lift', h.g(rr(9.4, 1.2, 5.2, 6.8, 2.6)) + h.g(rr(7.8, 7.8, 8.4, 2.6, 1.3)) + h.g('M10.4 10.4h3.2v8.4L12 21.4l-1.6-2.6Z'))}</g>` + dot(4.6, 20.4, 1.1, 'crm') },
  // Suite chrome (Yard's status chips and tools): bell, box, send, wrap, USB, terminal, cloud and server.
  bell: { name: 'Notifications', draw: (h) => part('swing', h.g('M6 10.2a6 6 0 0 1 12 0v4l1.6 2.7a.8.8 0 0 1-.7 1.2H5.1a.8.8 0 0 1-.7-1.2L6 14.2Z') + h.i('M10 20.6a2.2 2.2 0 0 0 4 0')) + dot(12, 3.2, 1.1) },
  box: { name: 'Container', draw: (h) => h.g('M3.8 7.6 12 3.6l8.2 4v9.2L12 20.8l-8.2-4Z') + h.i('M12 11.6v9.2', h.sw * 0.9) + h.g('M3.8 7.6 12 3.6l8.2 4-8.2 4Z', 'lift') },
  send: { name: 'Send', draw: (h) => part('go-ur', h.g('M3.6 11.2 20.4 3.6l-7.6 16.8-2.4-6.8Z') + h.i('M10.4 13.6 20.2 3.8', h.sw * 0.9)) },
  wrap: { name: 'Wrap lines', draw: (h) => h.i('M4 6h16', h.sw, 'r1') + h.i('M4 12h12.4a3 3 0 0 1 0 6H12', h.sw, 'r2') + h.i('M14.2 15.6 11.8 18l2.4 2.4', h.sw, 'go-l') + h.i('M4 18h4', h.sw, 'r3') },
  usb: { name: 'USB', draw: (h) => part('go-u', h.g(rr(8.4, 2.8, 7.2, 7.4, 1.4)) + `<path d="${rr(10, 5, 1.5, 1.8, 0.4)}${rr(12.5, 5, 1.5, 1.8, 0.4)}" fill="currentColor"/>`) + h.g(rr(6.6, 10, 10.8, 11.2, 2.6)) },
  terminal: { name: 'Terminal', draw: (h) => h.g(rr(2.5, 4, 19, 16, 3.2)) + h.i('M6.6 9.4 9.6 12l-3 2.6', h.sw, 'go') + ink(h, 'M12 15.2h5.2') },
  cloud: { name: 'Cloud', draw: (h) => h.g('M7.2 18.5a4.2 4.2 0 0 1-.6-8.4 5.8 5.8 0 0 1 11.2 1.6 3.4 3.4 0 0 1-.4 6.8Z', 'lift') },
  server: { name: 'Server', draw: (h) => [3.5, 13.3].map((y, i) => part(i ? 'l3' : 'l1', h.g(rr(3, y, 18, 7.2, 2.4)) + dot(6.8, y + 3.6, 1.1, i ? '' : 'day') + `<circle cx="10" cy="${y + 3.6}" r="1.1" fill="${h.soft}"/>` + h.i(`M14 ${y + 3.6}h3.6`, h.sw * 0.9))).join('') },
} satisfies Record<string, LineDef>;
