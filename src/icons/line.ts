/**
 * @file line.ts
 * @description Drift line: the grey outline icons of the rail, the pane shortcuts, toolbars and menus. They draw Drift's own shapes (the section stacks, a folder with its pocket, a task ring, a sync mark) in `currentColor` with a faint frosted tint and an occluding fill in the surface color (`--icon-bg`), so stacked sheets read cleanly. Each icon names the parts that move (`.st`, `.lid`, `.pocket` ...); styles/motion.css moves them when the icon's button is hovered or focused. Plain SVG strings, like the glass kit.
 * Ported from the icon generator page (drift-icons, GLYPHS and LINE_SECTIONS).
 * Used by: LineIcon.
 */
import { rr } from './glass.ts';

/** What a drawing may use: a stroke width and the paints that depend on the instance. */
export interface LineKit {
  /** The id prefix of this instance. */
  p: string;
  /** The line width. */
  sw: number;
  /** A closed shape: occluding fill, frosted tint, outline; `fon` also adds a coral fill that shows on hover or when set. */
  g: (d: string, cls?: string, fon?: boolean) => string;
  /** The same without the outline (a backdrop for a stroke). */
  back: (d: string) => string;
  /** An open stroke. */
  i: (d: string, w?: number, cls?: string, col?: string) => string;
  /** Flat tints of `currentColor`: 16, 30 and 55 percent. */
  faint: string;
  soft: string;
  mid: string;
}

const C24 = (cx: number, cy: number, r: number) => `M${cx - r},${cy}a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 ${-2 * r},0Z`;

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
  h.g(rr(3, 4.5, 18, 16.5, 3.2))
  + '<path d="M6.2 4.5h11.6a3.2 3.2 0 0 1 3.2 3.2V10H3V7.7a3.2 3.2 0 0 1 3.2-3.2Z" fill="currentColor"/>'
  + h.i('M8 2.6v3.4M16 2.6v3.4')
  + (journal
    ? h.i('M7 13.6h10', h.sw * 0.9) + h.i('M7 17h6', h.sw * 0.9, 'jl')
    : [[8, 14], [12, 14], [16, 14], [8, 17.4], [12, 17.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.15" fill="${h.soft}"/>`).join('') + '<circle class="day" cx="16" cy="17.4" r="1.6" fill="currentColor"/>');

export type Draw = (h: LineKit) => string;

/** Four tiles that spread apart (all boards, all bases). */
const tiles: Draw = (h) => ([[3, 3, 'q1'], [13.4, 3, 'q2'], [3, 13.4, 'q3'], [13.4, 13.4, 'q4']] as const).map(([x, y, k], i) => (i ? h.g(rr(x, y, 7.6, 7.6, 2.2), k) : `<path class="${k}" d="${rr(x, y, 7.6, 7.6, 2.2)}" fill="currentColor"/>`)).join('');

/** The action and shortcut icons. `fixed` icons stay coral: the create button and the sync mark. */
const GLYPHS = {
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
const SECTIONS = {
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

/** A stroke at reduced opacity (the faint ticks of Agenda and Visual): `i` has no opacity. */
const dim = (d: string, w: number, op: number, cls = '') => `<path class="${cls}" d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round"/>`;
/** A solid currentColor shape; the class names the part that moves. */
const solid = (d: string, cls = '') => `<path class="${cls}" d="${d}" fill="currentColor"/>`;
const FOLDER_BACK = 'M3 18V6a1.5 1.5 0 0 1 1.5-1.5h4l2 2h9A1.5 1.5 0 0 1 21 8v10Z';
const FOLDER_FRONT = 'M3 19.5h18l-1.2-9H4.2Z';
const folderBack = (h: LineKit) => `<path d="${FOLDER_BACK}" fill="${h.faint}" stroke="currentColor" stroke-width="${h.sw}" stroke-linejoin="round"/>`;
const PHOTO_HILLS = 'M4.2 18.8 9 13.8l3.3 3.3 2.2-2.2 5.3 4.6Z';

/** Round 3 additions (R3-A): the view switch, the arrange row, the item actions and the whiteboard tools. Same recipe as the rest: layered shapes that occlude, room between parts, a gesture in two or three staggered beats. */
const ADDED = {
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

export type BaseLineName = keyof typeof GLYPHS | keyof typeof SECTIONS | keyof typeof ADDED;

/**
 * The names an app adds with registerLineIcons. The app declares them by augmenting this interface
 * (`declare module '@frameer/icons/line' { interface ExtraLineNames { overview: true } }`), so LineIcon stays typed to exactly the icons that exist.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExtraLineNames {}

export type LineName = BaseLineName | keyof ExtraLineNames;

export interface LineDef {
  name: string;
  fixed?: boolean;
  draw: Draw;
}
const BASE: Record<BaseLineName, LineDef> = { ...GLYPHS, ...SECTIONS, ...ADDED };
const extra = new Map<string, LineDef>();

/** Adds an app's own drawings (Yard's section icons) to the set. Call it when the app's module loads, before the first icon renders. */
export function registerLineIcons(defs: Record<string, LineDef>): void {
  for (const [name, def] of Object.entries(defs)) extra.set(name, def);
}

const defOf = (name: LineName): LineDef => {
  const def = extra.get(name) ?? (BASE as Record<string, LineDef | undefined>)[name];
  if (!def) throw new Error(`Unknown line icon "${name}"; register it with registerLineIcons.`);
  return def;
};

/** The spoken name of an icon. */
export const lineLabel = (name: LineName) => defOf(name).name;

/** Sizes up to this many pixels use the heavier line. */
const HEAVY_MAX = 24;

/** The inside of a Drift line icon's SVG (everything but the `<svg>` element) and whether it is always coral. */
export function lineMarkup(name: LineName, prefix: string, size: number | null): { inner: string; fixed: boolean } {
  const def = defOf(name);
  const p = `${prefix}_`;
  const sw = size !== null && size <= HEAVY_MAX ? 1.7 : 1.5;
  const flat = (id: string, o: number) => `<linearGradient id="${p}${id}"><stop offset="0" stop-color="currentColor" stop-opacity="${o}"/><stop offset="1" stop-color="currentColor" stop-opacity="${o}"/></linearGradient>`;
  const body = (d: string, k: string, fon: boolean) =>
    `<g class="${k}"><path d="${d}" style="fill:var(--icon-bg, var(--paper))"/><path d="${d}" fill="url(#${p}lt)"/>${fon ? `<path class="fon" d="${d}" style="fill:var(--coral)"/>` : ''}<path class="${fon ? 'fs' : ''}" d="${d}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/></g>`;
  const kit: LineKit = {
    p,
    sw,
    faint: `url(#${p}s16)`,
    soft: `url(#${p}s30)`,
    mid: `url(#${p}s55)`,
    g: (d, k = '', fon = false) => body(d, k, fon),
    back: (d) => `<path d="${d}" style="fill:var(--icon-bg, var(--paper))"/><path d="${d}" fill="url(#${p}lt)"/>`,
    i: (d, w = sw, k = '', col = 'currentColor') => `<path class="${k}" d="${d}" fill="none" stroke="${col}" stroke-width="${Math.min(w, sw + 0.6)}" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  const defs = `<defs><linearGradient id="${p}lt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".11"/><stop offset="1" stop-color="currentColor" stop-opacity=".03"/></linearGradient><linearGradient id="${p}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".5"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>${flat('s16', 0.16)}${flat('s30', 0.3)}${flat('s55', 0.55)}</defs>`;
  return { inner: defs + def.draw(kit), fixed: Boolean(def.fixed) };
}
