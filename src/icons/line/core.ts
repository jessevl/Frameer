/**
 * @file core.ts
 * @description The first Drift line drawings: the rail sections (drawn from the section stacks: folder with papers and pocket, fanned prints, stacked pages, a fanned task card, a fanned board, a stacked base) and the shortcut and action icons of the rail and panes (search, trash, the coral create and sync marks ...).
 * Ported from the icon generator page (drift-icons, GLYPHS and LINE_SECTIONS).
 * Used by: line.ts.
 */
import { C24, calendarHead, rr, type Draw, type LineKit } from './kit.ts';

// Lucide paths the drawings reuse (ISC license).
const STAR = 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z';
const HEART = 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5Z';
const HOUSE = 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z';
const GEAR = 'M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915Z';
const SPARK = 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z';
const PIN = 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z';
const CLAP_TOP = 'M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z';
const CLAP_BODY = 'M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z';

const calendar = (h: LineKit, journal: boolean) =>
  calendarHead(h)
  + (journal
    ? h.i('M7 13.6h10', h.sw * 0.9) + h.i('M7 17h6', h.sw * 0.9, 'jl')
    : [[8, 14], [12, 14], [16, 14], [8, 17.4], [12, 17.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.15" fill="${h.soft}"/>`).join('') + '<circle class="day" cx="16" cy="17.4" r="1.6" fill="currentColor"/>');

/** Four tiles that spread apart (all boards, all bases). */
const tiles: Draw = (h) => ([[3, 3, 'q1'], [13.4, 3, 'q2'], [3, 13.4, 'q3'], [13.4, 13.4, 'q4']] as const).map(([x, y, k], i) => (i ? h.g(rr(x, y, 7.6, 7.6, 2.2), k) : `<path class="${k}" d="${rr(x, y, 7.6, 7.6, 2.2)}" fill="currentColor"/>`)).join('');

/** The action and shortcut icons. `fixed` icons stay coral: the create button and the sync mark. */
export const GLYPHS = {
  complete: { name: 'Complete a task', draw: (h) => h.g(C24(12, 12, 9), '', true) + h.i('M8 12.5l2.6 2.6L16.2 9.5', h.sw + 0.5, 'tick', '#FFFFFF') },
  star: { name: 'Star', draw: (h) => `<g class="st">${h.g(STAR, '', true)}</g><path class="burst" d="${C24(12, 12, 10.5)}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.6 2.6"/>` },
  heart: { name: 'Favorite', draw: (h) => `<g class="pop">${h.g(HEART, '', true)}</g>` },
  trash: { name: 'Trash', draw: (h) => h.g('M5.8 7.6h12.4l-1 11.8a1.8 1.8 0 0 1-1.8 1.6H8.6a1.8 1.8 0 0 1-1.8-1.6Z') + h.i('M10 11.2v5.6M14 11.2v5.6', h.sw * 0.9) + `<g class="lid">${h.g(rr(3.8, 4.6, 16.4, 2.8, 1.4))}${h.i('M9.4 4.6V3.6a1.2 1.2 0 0 1 1.2-1.2h2.8a1.2 1.2 0 0 1 1.2 1.2v1')}</g>` },
  folder: { name: 'Drop onto a folder', draw: (h) => `<path d="M3 18V6a1.5 1.5 0 0 1 1.5-1.5h4l2 2h9A1.5 1.5 0 0 1 21 8v10Z" fill="${h.faint}" stroke="currentColor" stroke-width="${h.sw}" stroke-linejoin="round"/>` + h.g('M3 19.5h18l-1.2-9H4.2Z', 'front') },
  upload: { name: 'Upload', draw: (h) => h.g(C24(12, 12, 9)) + `<circle class="prog" cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="${h.sw + 0.4}" stroke-linecap="round" transform="rotate(-90 12 12)"/><g class="arrow">${h.i('M12 16V8.5M8.8 11.5L12 8.3l3.2 3.2', h.sw + 0.3)}</g>` },
  sync: { name: 'Syncing', fixed: true, draw: (h) => h.back('M10 5h2a7 7 0 0 1 0 14h-2Z') + h.i('M10 5h2a7 7 0 0 1 0 14h-2', 2.4) + h.i('M4 12h6', 2.4, 's1') + h.i('M6 8h3', 2.4, 's2') + h.i('M6 16h3', 2.4, 's3') },
  share: { name: 'Share or open', draw: (h) => h.g(rr(3.5, 6.5, 13.5, 13.5, 3.2)) + `<g class="arr">${h.i('M14 3.5h6.5V10M20.5 3.5l-8.5 8.5', h.sw + 0.3)}</g>` },
  new: { name: 'New', fixed: true, draw: (h) => `<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="${C24(12, 12, 10)}" fill="url(#${h.p}gl)"/><g class="pl">${h.i('M12 7.5v9M7.5 12h9', 2.2, '', '#FFFFFF')}</g>` },
  // The create icon turned inside out for a coral button (the disc would vanish into it): a white disc with a coral plus, the same gesture.
  newon: { name: 'New', fixed: true, draw: (h) => `<circle cx="12" cy="12" r="10" fill="#FFFFFF"/><g style="color:var(--coral-strong)"><g class="pl">${h.i('M12 7.5v9M7.5 12h9', 2.2)}</g></g>` },
  search: { name: 'Search', draw: (h) => `<g class="lens">${h.g(C24(10.5, 10.5, 6.5))}${h.i('M20 20l-4.6-4.6', 2.8)}</g>` },
  panel: { name: 'Collapse the pane', draw: (h) => h.g(rr(3, 4, 18, 16, 3.2)) + '<rect class="pane" x="5.3" y="6.3" width="5" height="11.4" rx="1.5" fill="currentColor"/>' },
  home: { name: 'Home', draw: (h) => h.g(HOUSE) + '<path class="door" d="M10 20.6v-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6Z" fill="currentColor"/>' },
  mydrive: { name: 'My Drive', draw: (h) => h.g(rr(2.5, 5, 19, 14, 3.5)) + h.i('M2.5 12.6h19', h.sw * 0.9) + `<circle class="led" cx="6.6" cy="15.9" r="1.2" fill="currentColor"/><circle cx="10.2" cy="15.9" r="1.2" fill="${h.soft}"/>` },
  recent: { name: 'Recent', draw: (h) => h.g(C24(12, 12, 9)) + `<g class="hands vb">${h.i('M12 7.2V12l3.2 2', h.sw + 0.2)}</g><circle cx="12" cy="12" r="1.1" fill="currentColor"/>` },
  shared: { name: 'Shared', draw: (h) => h.i('M8.6 13.5l6.8 4M15.4 6.5l-6.8 4', h.sw * 0.9) + h.g(C24(18, 5, 3), 'n1') + h.g(C24(6, 12, 3), 'n2', true) + h.g(C24(18, 19, 3), 'n3') },
  activity: { name: 'Activity', draw: (h) => h.g(rr(2.5, 3.5, 19, 17, 4.5)) + h.i('M6 12.5h2.6l1.9-4.2 3 8.4 2-4.2H18', h.sw + 0.2, 'pulse') },
  duplicates: { name: 'Duplicates', draw: (h) => h.g(rr(3, 3, 12.5, 12.5, 3)) + `<g class="dup">${h.g(rr(8.5, 8.5, 12.5, 12.5, 3))}${h.i('M11.8 13h6M11.8 16.4h3.8', h.sw * 0.9)}</g>` },
  inbox: { name: 'Inbox', draw: (h) => `<path class="drop" d="${rr(8, 1.5, 8, 7, 1.4)}" fill="${h.faint}" stroke="currentColor" stroke-width="${h.sw * 0.8}"/>` + h.g('M3 13.5 5.8 6.8A2 2 0 0 1 7.6 5.5h8.8a2 2 0 0 1 1.8 1.3l2.8 6.7V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z') + h.i('M3 13.5h5l1.5 2.5h5l1.5-2.5h5', h.sw * 0.9) },
  today: { name: 'Today', draw: (h) => `<g class="rays vb">${h.i('M12 2.2v2M12 19.8v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.2 12h2M19.8 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4', h.sw + 0.1)}</g>` + h.g(C24(12, 12, 4.8), '', true) },
  upcoming: { name: 'Upcoming', draw: (h) => calendar(h, false) },
  alltasks: { name: 'All tasks', draw: (h) => ([[9, 'l3'], [6, 'l2'], [3, 'l1']] as const).map(([y, k]) => h.g(`M12 ${y}L21 ${y + 5}L12 ${y + 10}L3 ${y + 5}Z`, k)).join('') },
  journal: { name: 'Journal', draw: (h) => calendar(h, true) },
  timeline: { name: 'Timeline', draw: (h) => h.g(rr(3, 3, 18, 18, 3.5)) + `<rect class="r1" x="6" y="6.8" width="12" height="2.4" rx="1.2" fill="currentColor"/><rect class="r2" x="6" y="10.8" width="10" height="2.4" rx="1.2" fill="${h.mid}"/><rect class="r3" x="6" y="14.8" width="7" height="2.4" rx="1.2" fill="${h.soft}"/>` },
  videos: { name: 'Videos', draw: (h) => h.g(CLAP_BODY) + `<g class="clap">${h.g(CLAP_TOP)}${h.i('m12.3 3.46 3.02 3.96M6.18 5.28l3.1 3.9', h.sw * 0.9)}</g>` },
  places: { name: 'Places', draw: (h) => `<g class="bounce">${h.g(PIN)}<circle cx="12" cy="10" r="3" fill="currentColor"/></g>` },
  memories: { name: 'Memories', draw: (h) => `<g class="spk">${h.g(SPARK)}</g>` + h.i('M20 2v4M22 4h-4', h.sw, 'tw1') + '<circle class="tw2" cx="4" cy="20" r="2" fill="currentColor"/>' },
  allboards: { name: 'All boards', draw: tiles },
  allbases: { name: 'All bases', draw: tiles },
  settings: { name: 'Settings', draw: (h) => `<g class="gear">${h.g(GEAR)}<circle cx="12" cy="12" r="3" fill="currentColor"/></g>` },
} satisfies Record<string, { name: string; fixed?: boolean; draw: Draw }>;

/** The rail sections, drawn from the section stacks: folder with papers and pocket, fanned prints, stacked pages, a fanned task card, a fanned board, a stacked base. */
export const SECTIONS = {
  drive: { name: 'Drive', draw: (h) => `<path d="M3 7.2A2 2 0 0 1 5 5.2h3.6l1.6 1.6H19a2 2 0 0 1 2 2v9.4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" fill="${h.faint}" stroke="currentColor" stroke-width="${h.sw}" stroke-linejoin="round"/>`
    + `<g transform="rotate(-4 12 11)">${h.g(rr(6, 7.6, 12, 7, 1.2))}</g>`
    + `<g class="front">${h.g(rr(3, 11.2, 18, 9, 2))}<rect x="5.6" y="16.6" width="4.4" height="1.7" rx=".85" fill="currentColor"/></g>` },
  photos: { name: 'Photos', draw: (h) => `<g transform="rotate(9 12 12)"><g class="fanb">${h.g(rr(5, 3.5, 14.5, 16, 2.8))}</g></g>`
    + h.g(rr(3.5, 4.5, 14.5, 16, 2.8)) + `<path d="${rr(5.6, 6.6, 10.3, 8.4, 1.4)}" fill="${h.faint}"/><path d="M5.6 15 9 11.2l2.4 2.4 1.4-1.4 3.1 2.8Z" fill="${h.mid}"/><circle cx="13.4" cy="9.2" r="1.1" fill="${h.mid}"/>` + h.i('M6.5 17.8h4.5', h.sw * 0.9) },
  pages: { name: 'Pages', draw: (h) => h.g(rr(6.5, 2.6, 11, 15, 2.2)) + `<g class="lift">${h.g(rr(4.5, 4.8, 15, 16.4, 3))}<rect x="7" y="7.8" width="6.5" height="2" rx="1" fill="currentColor"/>${h.i('M7 12.4h10M7 15.4h7.5', h.sw * 0.9)}</g>` },
  tasks: { name: 'Tasks', draw: (h) => `<g transform="rotate(8 12 12)">${h.g(rr(4.5, 3.8, 15, 16.4, 3))}</g>` + h.g(rr(4.5, 3.8, 15, 16.4, 3))
    + '<circle cx="8.6" cy="9.4" r="1.9" fill="currentColor"/>' + h.i('M12 9.4h4.6', h.sw * 0.9) + h.g(C24(8.6, 15, 1.9), '', true) + h.i('M12 15h4.6', h.sw * 0.9) },
  whiteboards: { name: 'Whiteboards', draw: (h) => `<g transform="rotate(-7 12 12)">${h.g(rr(2.5, 5.2, 19, 13.6, 3))}</g>` + h.g(rr(2.5, 5.2, 19, 13.6, 3))
    + `<circle cx="7.2" cy="9.6" r="1.9" fill="currentColor"/><rect x="11.6" y="8" width="6" height="3.8" rx="1" stroke="currentColor" stroke-width="${h.sw * 0.9}"/>` + h.i('M5.5 15.6c1.4-1.5 2.6 1.1 4-.2s2.6-1.5 4 0 2.5.9 4-.4', h.sw, 'pulse') },
  bases: { name: 'Bases', draw: (h) => h.g(rr(6.5, 2.6, 11, 15, 2.2)) + h.g(rr(4.5, 4.8, 15, 16.4, 3)) + '<rect x="7" y="7.8" width="10" height="2.4" rx="1" fill="currentColor"/>'
    + h.i('M7 13h3M12 13h5', h.sw * 0.9, 'r1') + h.i('M7 16.4h3M12 16.4h3.6', h.sw * 0.9, 'r2') },
} satisfies Record<string, { name: string; draw: Draw }>;
