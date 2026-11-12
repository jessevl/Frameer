/**
 * @file actions.ts
 * @description The Drift line drawings of the screens' shared actions (round 3): the view switch, the arrange row, the item actions, the whiteboard tools and the menu actions. Same recipe as the sections: layered shapes that occlude, room between parts, a gesture in two or three staggered beats.
 * Used by: line.ts.
 */
import { C24, FOLDER_FRONT, PHOTO_HILLS, dim, folderBack, rr, solid } from './kit.ts';
import type { Draw } from './kit.ts';

export const ACTIONS = {
  list: { name: 'List', draw: (h) => `<g class="r1">${solid(rr(3, 3.3, 4.4, 4.4, 1.4), 'day')}${h.i('M10.6 5.5h10')}</g><g class="r2">${h.g(rr(3, 9.8, 4.4, 4.4, 1.4))}${h.i('M10.6 12h8')}</g><g class="r3">${h.g(rr(3, 16.3, 4.4, 4.4, 1.4))}${h.i('M10.6 18.5h5.6')}</g>` },
  visual: { name: 'Visual', draw: (h) => `<g class="ca">${h.g(rr(3, 3, 8, 11.5, 2.4))}<path d="M4.2 13.3 6.6 10.4l1.6 1.6 1-1 1.6 2.3Z" fill="${h.soft}"/><circle class="sun" cx="8.4" cy="6.3" r="1.1" fill="currentColor"/></g><g class="cb">${h.g(rr(13, 3, 8, 11.5, 2.4))}${solid(rr(14.8, 5.3, 4.4, 1.7, 0.85))}${h.i('M14.8 9.2h4.4M14.8 11.6h2.8', 1.3)}</g>${h.i('M3.4 18.2h5.2M13.4 18.2h4', 1.6)}${dim('M3.4 21h3M13.4 21h2.4', 1.4, 0.45)}` },
  agenda: { name: 'Agenda', draw: (h) => dim('M3 4.6h2M3 11.2h2M3 17.8h2', 1.5, 0.55, 'tk') + solid(rr(8, 3, 13, 5.2, 2), 'b1') + h.g(rr(8, 10.8, 9.5, 7.6, 2), 'b2') },
  board: { name: 'Board', draw: (h) => h.g(rr(3, 3, 4.6, 7.4, 1.6)) + h.g(rr(9.7, 3, 4.6, 4.6, 1.6)) + h.g(rr(16.4, 3, 4.6, 10, 1.6)) + h.g(rr(16.4, 15, 4.6, 4.6, 1.6)) + solid(rr(3, 12.3, 4.6, 4.6, 1.6), 'cd') },
  filter: { name: 'Filter', draw: (h) => '<circle class="dp1" cx="9" cy="1.8" r="1" fill="currentColor"/><circle class="dp2" cx="12.2" cy="1.2" r="1" fill="currentColor"/><circle class="dp3" cx="15" cy="1.8" r="1" fill="currentColor"/>' + h.g('M3.5 4.5h17l-6.6 7.7v6.1l-3.8 2v-8.1Z', 'fn') },
  sort: { name: 'Sort', draw: (h) => h.i('M4 6.5h8', h.sw, 'r1') + h.i('M4 12h5.5', h.sw, 'r2') + h.i('M4 17.5h3', h.sw, 'r3') + `<g class="ar">${h.i('M17 5v14M13.8 15.8 17 19l3.2-3.2')}</g>` },
  group: { name: 'Group', draw: (h) => `<g class="l1">${h.g(rr(3, 3, 18, 7.6, 2.4))}${solid(rr(5.6, 5.6, 5, 2.4, 1.2))}</g><g class="l3">${h.g(rr(3, 13.4, 18, 7.6, 2.4))}<path d="${rr(5.6, 16, 7.5, 2.4, 1.2)}" fill="${h.soft}"/></g>` },
  focus: { name: 'Focus', draw: (h) => h.i('M3.5 8V5.5a2 2 0 0 1 2-2H8M16 3.5h2.5a2 2 0 0 1 2 2V8M20.5 16v2.5a2 2 0 0 1-2 2H16M8 20.5H5.5a2 2 0 0 1-2-2V16', h.sw, 'br') + h.g(C24(12, 12, 4.2), 'rg') + '<circle class="dt" cx="12" cy="12" r="1.6" fill="currentColor"/>' },
  more: { name: 'More', draw: () => '<circle class="d1" cx="5.5" cy="12" r="1.8" fill="currentColor"/><circle class="d2" cx="12" cy="12" r="1.8" fill="currentColor"/><circle class="d3" cx="18.5" cy="12" r="1.8" fill="currentColor"/>' },
  quickview: { name: 'Quick view', draw: (h) => `<g class="eye">${h.g('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z')}<g class="pu"><circle cx="12" cy="12" r="3.3" fill="currentColor"/><circle cx="13.2" cy="10.8" r=".9" fill="#FFFFFF"/></g></g>` },
  copylink: { name: 'Copy link', draw: (h) => `<g class="lk1">${h.i('M10 13.5a4 4 0 0 0 5.6.4l3-3a4 4 0 0 0-5.7-5.7l-1.6 1.6')}</g><g class="lk2">${h.i('M14 10.5a4 4 0 0 0-5.6-.4l-3 3a4 4 0 0 0 5.7 5.7l1.6-1.6')}</g>` },
  download: { name: 'Download', draw: (h) => `<g class="tray">${h.g('M3.5 13.5h4.2l1.6 2.4h5.4l1.6-2.4h4.2v4.5a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5Z')}</g><g class="dn">${h.i('M12 3.5v8.5M8.6 8.8 12 12.2l3.4-3.4')}</g>` },
  moveto: { name: 'Move to', draw: (h) => folderBack(h) + h.g(FOLDER_FRONT, 'front') + `<g class="mv">${h.i('M7.8 15h7.4M12.6 12.5 15.2 15l-2.6 2.5')}</g>` },
  rename: { name: 'Rename', draw: (h) => `<g class="pen">${h.g('M15.2 4.3a2.1 2.1 0 0 1 3 0l1.5 1.5a2.1 2.1 0 0 1 0 3L9.4 19.1l-4.9 1.2 1.2-4.9Z')}${h.i('M13.4 6.1l4.5 4.5')}</g>` + h.i('M13 20.4h7', h.sw, 'ul') },
  copy: { name: 'Make a copy', draw: (h) => h.g(rr(3, 3, 12.5, 12.5, 3)) + `<g class="dup">${h.g(rr(8.5, 8.5, 12.5, 12.5, 3))}<g class="plc">${h.i('M14.75 12.4v4.7M12.4 14.75h4.7')}</g></g>` },
  tag: { name: 'Tag', draw: (h) => `<g class="tg">${h.g('M3.5 5.5v5.3a2 2 0 0 0 .6 1.4l7.7 7.7a2 2 0 0 0 2.8 0l5.3-5.3a2 2 0 0 0 0-2.8L12.2 4.1a2 2 0 0 0-1.4-.6H5.5a2 2 0 0 0-2 2Z')}<circle class="day" cx="8" cy="8" r="1.5" fill="currentColor"/></g>` },
  versions: { name: 'Versions', draw: (h) => `<path d="${C24(12.5, 12, 8.4)}" fill="${h.faint}"/>` + h.i('M4.1 12a8.4 8.4 0 1 0 2.5-6L4.1 8.5') + `<g class="ah">${h.i('M4.1 4v4.5h4.5')}</g><g class="hb">${h.i('M12.5 7.6V12l3 2')}</g>` },
  archive: { name: 'Archive', draw: (h) => h.g('M4 8h16v10.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5Z') + `<g class="lid">${h.g(rr(2.5, 3.6, 19, 4.4, 1.6))}</g>` + h.i('M9.5 12h5', h.sw, 'slt') },
  smartfolder: { name: 'Smart folder', draw: (h) => folderBack(h) + h.g(FOLDER_FRONT, 'front') + `<g class="lens">${h.g(C24(11.6, 14.4, 2.8))}${h.i('M13.7 16.5l2.3 2.3')}</g>` },
  albums: { name: 'Albums', draw: (h) => `<g transform="rotate(8 12 12)"><g class="fanb">${h.g(rr(6, 3, 14, 14, 2.8))}</g></g><g class="lift">${h.g(rr(3.5, 6.5, 14, 14, 2.8))}<path d="M4.8 19.2 8.8 15l2.7 2.7 1.7-1.7 3.6 3.2Z" fill="${h.soft}"/><circle class="day" cx="13.6" cy="10.6" r="1.3" fill="currentColor"/></g>` },
  cover: { name: 'Cover, image', draw: (h) => h.g(rr(3, 4, 18, 16, 3)) + `<path class="mt" d="${PHOTO_HILLS}" fill="${h.soft}"/><circle class="sun" cx="15.6" cy="9" r="1.7" fill="currentColor"/>` },
  invite: { name: 'Invite', draw: (h) => h.g(C24(9, 8, 3.6), 'lift') + h.g('M2.8 20a6.2 6.2 0 0 1 12.4 0Z') + `<g class="pl">${h.i('M19 8.5v6M16 11.5h6')}</g>` },
  select: { name: 'Select', draw: (h) => '<circle class="burst" cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.2 1.8"/>' + `<g class="pt">${h.g('M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z')}</g>` },
  hand: { name: 'Hand', draw: (h) => `<g class="wv">${h.g('M18 11V6a2 2 0 0 0-4 0V4a2 2 0 0 0-4 0v2.2A2 2 0 0 0 6 6v8l-1.6-1.6a2 2 0 0 0-2.8 2.8l3.6 3.6C6.7 20.3 8.6 21.5 12 21.5h2a8 8 0 0 0 8-8V8a2 2 0 0 0-4 0Z')}${h.i('M10 6.2V11M14 6v5M18 8v3', 1.4)}</g>` },
  shapes: { name: 'Shapes', draw: (h) => h.g('M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z', 'tri') + h.g(rr(3, 14, 7, 7, 1.4), 'sq') + h.g(C24(17.5, 17.5, 3.5), 'ci') },
  arrows: { name: 'Arrows, lines', draw: (h) => h.i('M4.5 19.5 19 5', h.sw, 'dr') + h.i('M11.5 4.5h8v8', h.sw, 'hd') },
  elbow: { name: 'Elbow arrow', draw: (h) => h.i('M4 19.5h7.5V5.5H19', h.sw, 'dr') + h.i('m15.8 2.3 3.2 3.2-3.2 3.2', h.sw, 'hd') },
  draw: { name: 'Draw', draw: (h) => h.i('M3.5 17.5c2.5-4 4.5-4 5.5-1.5s3 2.5 5-1.5 4-6 6.5-6', h.sw, 'dr') + '<circle class="hd" cx="20.5" cy="8.5" r="1.4" fill="currentColor"/>' },
  text: { name: 'Text', draw: (h) => `<g class="lift">${h.i('M5 6.5V4.5h11v2M10.5 4.5v15M8 19.5h5')}</g>` + h.i('M19 9v10', 1.5, 'cr') },
  eraser: { name: 'Eraser', draw: (h) => `<g class="er">${h.g('M8.6 20.5 3.9 15.8a1.8 1.8 0 0 1 0-2.6l9.3-9.3a1.8 1.8 0 0 1 2.6 0l4.3 4.3a1.8 1.8 0 0 1 0 2.6l-9.8 9.7Z')}${h.i('M9.3 9.8l5.6 5.6')}</g><circle class="crm" cx="17" cy="19" r=".9" fill="currentColor"/>` + h.i('M8.6 20.5h5') },
  open: { name: 'Open', draw: (h) => h.g(rr(3.5, 3.5, 17, 17, 3.6)) + `<g class="mv">${h.i('M8 12h8M12.8 8.8 16 12l-3.2 3.2')}</g>` },
  opentab: { name: 'Open in new tab', draw: (h) => h.g(rr(8, 3, 13, 11, 2.6)) + `<g class="lift">${h.g(rr(3, 8.5, 13.5, 12.5, 2.6))}${h.i('M3 12.6h13.5', h.sw * 0.9)}<circle cx="5.8" cy="10.6" r=".7" fill="currentColor"/></g>` },
  cut: { name: 'Cut', draw: (h) => `<g class="tri">${h.i('M8 8.4 19.5 20')}${h.g(C24(6, 6.5, 2.8))}</g><g class="sq">${h.i('M8 15.6 19.5 4')}${h.g(C24(6, 17.5, 2.8))}</g>` },
  clipboard: { name: 'Copy', draw: (h) => h.g(rr(4.5, 4.5, 15, 16.5, 3)) + `<g class="lift">${h.g(rr(8.5, 2.5, 7, 4, 1.4))}</g>` + h.i('M8.5 12h7', h.sw * 0.9, 'r1') + h.i('M8.5 15.8h4.4', h.sw * 0.9, 'r2') },
  copyto: { name: 'Copy to', draw: (h) => h.g(rr(3, 3, 11.5, 12.5, 3)) + `<g class="mv">${h.i('M10 18.5h9.5M16.2 15.2l3.3 3.3-3.3 3.3')}</g>` },
  offline: { name: 'Keep offline', draw: (h) => h.g(C24(12, 12, 9)) + `<g class="dn">${h.i('M12 7.5v8M8.6 12.4l3.4 3.4 3.4-3.4')}</g>` },
  offlineoff: { name: 'Remove offline copy', draw: (h) => h.g(C24(12, 12, 9)) + `<g class="pl">${h.i('M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6')}</g>` },
  extract: { name: 'Extract', draw: (h) => h.g('M4 10h16v8.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5Z') + `<g class="lift">${h.i('M12 3v8M8.6 6.4 12 3l3.4 3.4')}</g>` + h.i('M9.5 14.5h5', h.sw, 'slt') },
  palette: { name: 'Icon and color', draw: (h) => h.g('M12 3a9 9 0 1 0 0 18c1.4 0 2.2-1 1.7-2.2-.5-1.2.3-2.3 1.6-2.3H17a4 4 0 0 0 4-4C21 7 17 3 12 3Z') + '<circle class="d1" cx="7.8" cy="11" r="1.2" fill="currentColor"/><circle class="d2" cx="10.6" cy="7.4" r="1.2" fill="currentColor"/><circle class="d3" cx="15.2" cy="7.8" r="1.2" fill="currentColor"/>' },
  info: { name: 'Info', draw: (h) => h.g(C24(12, 12, 9)) + h.i('M12 11v5.2') + '<circle class="day" cx="12" cy="7.9" r="1.2" fill="currentColor"/>' },
  addpage: { name: 'Add subpage', draw: (h) => h.g(rr(4.5, 2.6, 15, 18.8, 3)) + `<g class="plc">${h.i('M12 8.6v7M8.5 12.1h7')}</g>` },
  demote: { name: 'Make a page', draw: (h) => h.g(rr(4.5, 2.6, 15, 18.8, 3)) + `<g class="lift">${h.i('M12 16.4V8.6M8.8 11.8 12 8.6l3.2 3.2')}</g>` },
  clearsel: { name: 'Clear selection', draw: (h) => `<g class="pl">${h.i('M6 6l12 12M18 6 6 18')}</g>` },
  // Frameer's chrome icons for a planned span and a to-do list (empty states, ChromeIconsProvider): the calendar with bars that slide in, a list of two check boxes.
  calendarrange: { name: 'Planned days', draw: (h) => h.g(rr(3, 4.5, 18, 16.5, 3.2)) + '<path d="M6.2 4.5h11.6a3.2 3.2 0 0 1 3.2 3.2V10H3V7.7a3.2 3.2 0 0 1 3.2-3.2Z" fill="currentColor"/>' + h.i('M8 2.6v3.4M16 2.6v3.4') + solid(rr(6.2, 12.4, 8.6, 2.8, 1.4), 'b1') + `<path class="b2" d="${rr(9.4, 16.4, 8.4, 2.4, 1.2)}" fill="${h.soft}"/>` },
  listtodo: { name: 'Task checklist', draw: (h) => `<g class="r1">${h.g(rr(3, 3.6, 6.4, 6.4, 1.8))}${h.i('M4.9 6.9l1.3 1.3 2-2.3', h.sw * 0.9, 'tk')}${h.i('M13 6.8h8')}</g><g class="r2">${h.g(rr(3, 14, 6.4, 6.4, 1.8))}${h.i('M13 17.2h6')}</g>` },
} satisfies Record<string, { name: string; draw: Draw }>;
