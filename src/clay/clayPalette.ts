/**
 * @file clayPalette.ts
 * @description Reads the clay palette from the `--clay-*` tokens (tokens.css) where a picture is, so the pictures follow light and dark mode (and always-dark scenes) without a color of their own. Cached per theme; `forgetClayPalette` drops the cache when tokens change.
 * Used by: ClayCanvas.
 */
import type { ClayPalette, Greys } from './clay';

const cached = new Map<boolean, ClayPalette>();

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

/**
 * The palette where an element is: dark inside any `.dark` (the document in dark mode, or a scene that is always dark,
 * like Focus), light elsewhere. Read once per theme, from the element's own computed tokens.
 */
export function clayPalette(el: Element = document.documentElement): ClayPalette {
  const dark = el.closest('.dark') !== null;
  const known = cached.get(dark);
  if (known) return known;
  const style = getComputedStyle(el);
  const pal = paletteFrom((name) => style.getPropertyValue(name).trim(), dark);
  cached.set(dark, pal);
  return pal;
}

export function forgetClayPalette(): void {
  cached.clear();
}
