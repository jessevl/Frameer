/**
 * @file styles.ts
 * @description The style layer of the house pictures: one setting that changes every picture. A style remaps each colour through a ramp between two clay tones by its lightness, keeps some of the original hue for chosen materials, never touches protected colours (coral's status steps, white, screen and lamp light), and sets the finish: edge strength, corner rounding, shadow softness, plain floors and rugs, how much small clutter is drawn, the grain, how much of a lamp's own colour shows and the night's ambient light. Style G, `half` ("Halfway"), is the default (Hearth D-1); the others stay selectable for comparison.
 * Ported from hearth-concept/clay2/styles.js.
 * Used by: stage.ts (every colour goes through `xf`), house.ts, closeup.ts, HousePicture.
 */
import { mix } from '../../icons/palette';
import { lum, rgbOf, toHex, type Colors, type MaterialName } from './colors';

/** The styles, by name: A `rich`, B `clay`, C `birch`, D `stone`, E `lantern`, F `blush`, G `half` (the default), H `stoneclay`, I `clayoak`. */
export type StyleName = 'rich' | 'clay' | 'birch' | 'stone' | 'blush' | 'half' | 'stoneclay' | 'clayoak' | 'lantern';

/** The style G, "Halfway": the suite's clay pictures are drawn in it. */
export const DEFAULT_STYLE: StyleName = 'half';

/** What a style sets besides its colours. */
export interface Finish {
  /** No planks, tiles or rug patterns. */
  plain: boolean;
  /** Small clutter left out: `true` all of it (and frames show plain art), `'half'` the smallest things, `false` none. */
  sparse: boolean | 'half';
  /** Strength of the light top edges, 1 as drawn. */
  edge: number;
  /** Grain over the picture. */
  grain: number;
  /** How far a lamp's own colour moves toward warm white (0 keeps it). */
  lightTint: number;
  /** The night's ambient light, if the style has its own. */
  ambient?: readonly [number, number, number];
  /** How soft the shadow under each floor is, 1 as drawn. */
  softShadow: number;
  /** Corner rounding of rounded boxes, 1 as drawn. */
  round: number;
  /** Lamp levels multiplied (a dark style makes its lamps brighter). */
  glowBoost: number;
}

interface StyleDef extends Partial<Finish> {
  /** The ramp: dark and light end, how much of the original colour is kept, and the lightness curve. */
  ramp?: { dark: string; light: string; keep: number; gamma: number };
  /** Materials that keep more of their own colour, 0 to 1. */
  keep?: Partial<Record<MaterialName, number>>;
}

const ramp = (dark: string, light: string, keep = 0, gamma = 1) => ({ dark, light, keep, gamma });

/** The style definitions. Letters as on the design canvas's "Clay styles" page. */
export const STYLES: Readonly<Record<StyleName, Readonly<StyleDef>>> = {
  // A: full colour, plank floors, patterns, lots of small things.
  rich: {},
  // B: Frameer's clay: warm greys like the suite's pictures, coral only where something is lit, nothing small.
  clay: {
    ramp: ramp('#8C837A', '#FBF8F4', 0.08, 0.8),
    keep: { coral: 1, coralLight: 1, coralDeep: 1, skin: 0.6, leaf: 0.3, leaf2: 0.3, leafDark: 0.3, terracotta: 0.35 },
    plain: true, sparse: true, edge: 0.45, grain: 0.045, lightTint: 0.8, ambient: [92, 86, 84], softShadow: 1.4, round: 1.8,
  },
  // C: a birch dollhouse: everything in pale wood, painted only here and there.
  birch: {
    ramp: ramp('#A27C58', '#F8EEDF', 0.12, 0.75),
    keep: { coral: 0.9, coralLight: 0.9, sage: 0.6, sageLight: 0.6, sageDeep: 0.6, leaf: 0.7, leaf2: 0.7, leafDark: 0.7, blue: 0.45, mustard: 0.5, skin: 0.7 },
    plain: true, sparse: true, edge: 0.55, grain: 0.05, lightTint: 0.6, ambient: [96, 84, 76], softShadow: 1.2, round: 1.4,
  },
  // D: a calm middle: the colours of now, stone-washed, no textures, half the clutter.
  stone: {
    ramp: ramp('#A39A90', '#FCFAF7', 0.55, 0.85),
    keep: { coral: 0.9, coralLight: 0.9, leaf: 0.7, leaf2: 0.7, leafDark: 0.7, mustard: 0.75, blue: 0.7, terracotta: 0.75 },
    plain: true, sparse: 'half', edge: 0.6, grain: 0.035, lightTint: 0.35, ambient: [88, 84, 100],
  },
  // F: clay with a blush of colour: greens, coral and terracotta come through, everything else stays clay.
  blush: {
    ramp: ramp('#8F867C', '#FBF9F5', 0.2, 0.8),
    keep: { coral: 1, coralLight: 1, skin: 0.7, leaf: 0.65, leaf2: 0.65, leafDark: 0.65, sage: 0.5, sageLight: 0.5, sageDeep: 0.5, terracotta: 0.6, blush: 0.6 },
    plain: true, sparse: true, edge: 0.5, grain: 0.042, lightTint: 0.7, ambient: [92, 86, 88], softShadow: 1.35, round: 1.6,
  },
  // G: halfway: a third of the full colour, half the clutter, softer forms.
  half: {
    ramp: ramp('#988E84', '#FCF9F6', 0.33, 0.82),
    keep: { coral: 0.95, coralLight: 0.95, skin: 0.7, leaf: 0.75, leaf2: 0.75, leafDark: 0.75, mustard: 0.55, blue: 0.45, terracotta: 0.7, sage: 0.6 },
    plain: true, sparse: 'half', edge: 0.52, grain: 0.04, lightTint: 0.55, ambient: [90, 85, 94], softShadow: 1.25, round: 1.4,
  },
  // H: stone-washed colours on clay forms: D's palette, B's rounding and emptiness.
  stoneclay: {
    ramp: ramp('#A39A90', '#FCFAF7', 0.5, 0.85),
    keep: { coral: 0.9, coralLight: 0.9, leaf: 0.7, leaf2: 0.7, leafDark: 0.7, mustard: 0.7, blue: 0.65, terracotta: 0.7 },
    plain: true, sparse: true, edge: 0.45, grain: 0.042, lightTint: 0.45, ambient: [90, 85, 96], softShadow: 1.4, round: 1.8,
  },
  // I: clay with warm wood: B's greys, but floors, tables and frames keep their oak.
  clayoak: {
    ramp: ramp('#8C837A', '#FBF8F4', 0.1, 0.8),
    keep: { coral: 1, coralLight: 1, skin: 0.6, wood: 0.75, woodDeep: 0.75, oak: 0.8, walnut: 0.7, leaf: 0.45, leaf2: 0.45, leafDark: 0.45, terracotta: 0.45 },
    plain: true, sparse: true, edge: 0.45, grain: 0.045, lightTint: 0.75, ambient: [94, 86, 82], softShadow: 1.4, round: 1.7,
  },
  // E: a dark architectural model: the house in slate, all colour comes from the lamps.
  lantern: {
    ramp: ramp('#25262A', '#7D7A78', 0.06, 0.9),
    keep: { skin: 0.5, coral: 0.5 },
    plain: true, sparse: true, edge: 0.3, grain: 0.04, lightTint: 0.15, ambient: [70, 70, 84], glowBoost: 1.35,
  },
};

/** Every style's name, A to I as on the canvas. */
export const STYLE_NAMES: readonly StyleName[] = ['rich', 'clay', 'birch', 'stone', 'lantern', 'blush', 'half', 'stoneclay', 'clayoak'];

/** Colours a style never changes: status lights, white, lamp and screen light. */
export const PROTECTED: ReadonlySet<string> = new Set(['#63BE84', '#F0705A', '#B9483A', '#F0B450', '#FF8A66', '#FFD08A', '#F0703C', '#5E9BE0', '#FFFFFF', '#FFF6EA', '#FFF1DC', '#FFE9C8', '#FFE9C0']);

/** A style ready to draw with: its finish and the colour transform. */
export interface Style extends Finish {
  name: StyleName;
  /** A `#RRGGBB` colour as the style draws it; anything else (rgba, gradients) unchanged. */
  xf: (c: string) => string;
}

/** The style `name` for the materials in use (`colors` decides which hex each kept material has). */
export function makeStyle(name: StyleName, colors: Colors): Style {
  const def = STYLES[name];
  const finish: Finish = {
    plain: def.plain ?? false,
    sparse: def.sparse ?? false,
    edge: def.edge ?? 1,
    grain: def.grain ?? 0.03,
    lightTint: def.lightTint ?? 0,
    ambient: def.ambient,
    softShadow: def.softShadow ?? 1,
    round: def.round ?? 1,
    glowBoost: def.glowBoost ?? 1,
  };
  const r = def.ramp;
  if (!r) return { name, ...finish, xf: (c) => c };
  const keep = new Map<string, number>();
  for (const [k, v] of Object.entries(def.keep ?? {}) as [MaterialName, number][]) keep.set(colors[k].toUpperCase(), v);
  const base = (c: string) => {
    const L = Math.pow(lum(c), r.gamma);
    const b = rgbOf(mix(r.dark, r.light, L));
    const o = rgbOf(c);
    return toHex(b.map((v, i) => v + (o[i] - v) * r.keep));
  };
  const memo = new Map<string, string>();
  const xf = (c: string): string => {
    if (!/^#[0-9a-f]{6}$/i.test(c)) return c;
    const u = c.toUpperCase();
    if (PROTECTED.has(u)) return c;
    const known = memo.get(u);
    if (known) return known;
    const k = keep.get(u) ?? 0;
    const out = k ? mix(base(c), c, k) : base(c);
    memo.set(u, out);
    return out;
  };
  return { name, ...finish, xf };
}
