/**
 * @file palette.ts
 * @description The color steps of a glass icon, derived from one base color the way the sister apps derive their coral set: two sheet gradients, the ink gradient, the mark greys, the body tint and the shadow. A hex base gives hex steps (the app-icon script renders them with sharp); a `var(--token)` base gives `color-mix()` steps, so one icon follows a CSS variable (the item's hue, light or dark theme) without any JavaScript color math at render time.
 * Used by: glass.ts, kinds.ts, appIcon.ts, GlassIcon.
 */

/** The steps every glass drawing reads. */
export interface Palette {
  s3: readonly [string, string];
  s2: readonly [string, string];
  ink: readonly [string, string];
  strong: string;
  mid: string;
  soft: string;
  bodyMid: string;
  body: string;
  caustic: string;
  shade: string;
  shadow: string;
}

export const WHITE = '#FFFFFF';
export const BLACK = '#000000';

const HEX = /^#[0-9a-f]{6}$/i;

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** `a` moved toward `b` by `t` (0 to 1). Hex stays hex; anything else becomes a `color-mix()`. */
export function mix(a: string, b: string, t: number): string {
  if (HEX.test(a) && HEX.test(b)) {
    const from = channels(a);
    const to = channels(b);
    const hex = from.map((v, i) => Math.round(v + ((to[i] ?? v) - v) * t).toString(16).padStart(2, '0'));
    return `#${hex.join('')}`.toUpperCase();
  }
  const pct = (n: number) => Math.round(n * 1000) / 10;
  return `color-mix(in srgb, ${a} ${pct(1 - t)}%, ${b} ${pct(t)}%)`;
}

/** The coral set copied from the sister apps' icons: the app icon and the sync mark use it as is. */
export const CORAL_PALETTE: Palette = {
  s3: ['#FDD4C4', '#F5B199'],
  s2: ['#FAB79F', '#EE8D70'],
  ink: ['#F4795C', '#C63A22'],
  strong: '#B9705B',
  mid: '#C2836F',
  soft: '#D2A695',
  bodyMid: '#FFFAF6',
  body: '#FCEDE3',
  caustic: '#FF6A44',
  shade: '#C4502F',
  shadow: '#7A2A18',
};

/** The same steps as the coral set, derived from one base color. */
export function paletteOf(base: string): Palette {
  const strong = mix(mix(base, '#8C827B', 0.5), BLACK, 0.06);
  return {
    s3: [mix(base, WHITE, 0.8), mix(base, WHITE, 0.62)],
    s2: [mix(base, WHITE, 0.56), mix(base, WHITE, 0.3)],
    ink: [mix(base, WHITE, 0.14), mix(base, BLACK, 0.2)],
    strong,
    mid: mix(strong, WHITE, 0.14),
    soft: mix(strong, WHITE, 0.42),
    bodyMid: mix(base, WHITE, 0.975),
    body: mix(base, WHITE, 0.9),
    caustic: base,
    shade: mix(base, BLACK, 0.15),
    shadow: mix(base, BLACK, 0.62),
  };
}

/** An SVG paint attribute: references and hex values fit an attribute; `color-mix()` and `var()` need a style declaration. */
export function paint(property: 'fill' | 'stroke' | 'stop-color' | 'flood-color', value: string): string {
  return value.startsWith('url(') || HEX.test(value) ? `${property}="${value}"` : `style="${property}:${value}"`;
}
