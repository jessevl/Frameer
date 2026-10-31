/**
 * @file clayPalette.ts
 * @description Reads the clay palette of the current theme from the `--clay-*` tokens (tokens.css), so the pictures follow light and dark mode without a color of their own. Cached per theme; `forgetClayPalette` drops the cache when tokens change.
 * Used by: ClayCanvas.
 */
import type { ClayPalette, Greys } from './clay';

let cached: { dark: boolean; pal: ClayPalette } | null = null;

/** The palette from computed tokens; `read` is the token lookup (the document's computed style in the app, a map in tests). */
export function paletteFrom(read: (name: string) => string, dark: boolean): ClayPalette {
  const num = (name: string, fallback: number) => {
    const v = parseFloat(read(name));
    return Number.isFinite(v) ? v : fallback;
  };
  const grey = (i: number) => read(`--clay-${i}`);
  const g: Greys = [grey(0), grey(1), grey(2), grey(3), grey(4), grey(5), grey(6), grey(7), grey(8)];
  return {
    g,
    coral: read('--coral'),
    coralLight: read('--clay-coral-light'),
    coralDeep: read('--coral-strong'),
    shade: read('--clay-shade'),
    warm: read('--clay-warm'),
    top: num('--clay-top', 0.42),
    side: num('--clay-side', 0.1),
    dark,
  };
}

/** The current theme's palette, read once per theme. */
export function clayPalette(): ClayPalette {
  const root = document.documentElement;
  const dark = root.classList.contains('dark');
  if (cached?.dark === dark) return cached.pal;
  const style = getComputedStyle(root);
  const pal = paletteFrom((name) => style.getPropertyValue(name).trim(), dark);
  cached = { dark, pal };
  return pal;
}

export function forgetClayPalette(): void {
  cached = null;
}
