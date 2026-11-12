/**
 * @file line.ts
 * @description Drift line: the grey outline icons of the rail, the pane shortcuts, toolbars, menus and Frameer's own chrome. They draw Drift's own shapes (the section stacks, a folder with its pocket, a task ring, a sync mark) in `currentColor` with a faint frosted tint and an occluding fill in the surface color (`--icon-bg`), so stacked sheets read cleanly. Each icon names the parts that move (`.st`, `.lid`, `.pocket` ...); styles/motion.css moves them when the icon's button is hovered or focused. Plain SVG strings, like the glass kit. The drawings live in `line/` by group; this module is the registry and the renderer.
 * Ported from the icon generator page (drift-icons, GLYPHS and LINE_SECTIONS).
 * Used by: LineIcon, ChromeIcons (`lineChrome`), the apps' icon modules and the set's tests (lineSet.test.tsx).
 */
import { ACTIONS } from './line/actions.ts';
import { ARROWS } from './line/arrows.ts';
import { GLYPHS, SECTIONS } from './line/core.ts';
import type { LineDef, LineKit } from './line/kit.ts';
import { LAYOUT } from './line/layout.ts';
import { MARKS } from './line/marks.ts';
import { PHOTO } from './line/photo.ts';
import { TEXT } from './line/text.ts';
import { THINGS } from './line/things.ts';

export type { Draw, LineDef, LineKit } from './line/kit.ts';

const GROUPS = { GLYPHS, SECTIONS, ACTIONS, ARROWS, MARKS, TEXT, THINGS, LAYOUT, PHOTO };

export type BaseLineName = { [G in keyof typeof GROUPS]: keyof (typeof GROUPS)[G] }[keyof typeof GROUPS];

/**
 * The names an app adds with registerLineIcons. The app declares them by augmenting this interface
 * (`declare module '@frameer/icons/line' { interface ExtraLineNames { overview: true } }`), so LineIcon stays typed to exactly the icons that exist.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExtraLineNames {}

export type LineName = BaseLineName | keyof ExtraLineNames;

/** The groups merged; a name drawn in two groups is a mistake, caught when the module loads. */
const BASE = Object.values(GROUPS).reduce<Record<string, LineDef>>((all, group) => {
  for (const [name, def] of Object.entries(group)) {
    if (all[name]) throw new Error(`The line icon "${name}" is drawn twice.`);
    all[name] = def;
  }
  return all;
}, {}) as Record<BaseLineName, LineDef>;

/** Every drawing of the set, in group order (the contact sheet and the tests walk it). */
export const allLineNames = (): BaseLineName[] => Object.keys(BASE) as BaseLineName[];
const extra = new Map<string, LineDef>();

/**
 * A set of app drawings whose names are all new: a name the set already draws is typed `never`, so reusing one fails to compile.
 * An app drawing never replaces Frameer's (Frameer's chrome would silently draw the app's): draw the shared meaning once, in the set.
 */
export type NewLineDefs<T extends Record<string, LineDef>> = T & { [K in Extract<keyof T, BaseLineName>]: never };

/**
 * Adds an app's own drawings (the ones only that app needs) to the set. Call it when the app's module loads, before the first icon renders.
 * Throws when a name is already drawn by the set, so a collision fails the app's tests (and its first render) instead of overriding Frameer's drawing.
 * Registering an app name again replaces it: that is the app's module reloaded (hot reload, a test's fresh import).
 */
export function registerLineIcons<T extends Record<string, LineDef>>(defs: NewLineDefs<T>): void {
  for (const [name, def] of Object.entries(defs as Record<string, LineDef>)) {
    if (Object.prototype.hasOwnProperty.call(BASE, name)) throw new Error(`The line icon "${name}" is Frameer's; an app may not draw it again. Use Frameer's drawing, or give the app's own drawing a name of its own.`);
    extra.set(name, def);
  }
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
    `<g class="${k}"><path d="${d}" style="fill:var(--icon-bg, var(--paper))"/><path d="${d}" fill="url(#${p}lt)"/>${fon ? `<path class="fon" d="${d}" style="fill:var(--icon-on, var(--coral))"/>` : ''}<path class="${fon ? 'fs' : ''}" d="${d}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/></g>`;
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
