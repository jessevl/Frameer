/**
 * @file suiteIconFiles.ts
 * @description The icon files every suite app ships in public/icons, as data: the SVGs (home-screen tile, maskable, no backdrop, small, rail, outline, adaptive favicon) and the PNG jobs (16 px coral tile, 32 and 48 px paper card, the full tile from 72 px, maskable and dark 192/512), each from the drawing made for its size. An app's scripts/render-app-icons.mjs writes them and rasterises the PNGs; the app adds only what is its own (shortcut icons, launcher mipmaps).
 * Plain strings, so Node runs it directly.
 * Used by: the apps' scripts/render-app-icons.mjs.
 */
import { suiteMarkSvg, type SuiteApp } from './suiteMark.ts';

export const DEVICE_SIZES = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512] as const;
export const MASKABLE_SIZES = [192, 512] as const;
export const DARK_PAPER = '#171515';

/** The full card on the dark paper, full bleed, for the dark app icons. */
export function darkIconSvg(app: SuiteApp): string {
  const inner = suiteMarkSvg(app, 'full', 'dk').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${DARK_PAPER}"/><g transform="translate(256 256) scale(.78) translate(-256 -256)">${inner}</g></svg>`;
}

/** The SVG files by name. */
export function suiteIconSvgs(app: SuiteApp): Record<string, string> {
  return {
    'app-icon.svg': suiteMarkSvg(app, 'backdrop', 'b'),
    'app-icon-maskable.svg': suiteMarkSvg(app, 'maskable', 'c'),
    'app-icon-no-backdrop.svg': suiteMarkSvg(app, 'full', 'a'),
    'app-icon-small.svg': suiteMarkSvg(app, 'tile', 'd'),
    'app-icon-rail.svg': suiteMarkSvg(app, 'paper', 'r'),
    'app-icon-outline.svg': suiteMarkSvg(app, 'mono', 'e'),
    'favicon.svg': suiteMarkSvg(app, 'favicon', 'f'),
  };
}

/** The PNG files: `[file, svg, size]`. */
export function suiteIconPngs(app: SuiteApp): [string, string, number][] {
  const out: [string, string, number][] = [
    ['icon-16.png', suiteMarkSvg(app, 'tile', 't'), 16],
    ['icon-32.png', suiteMarkSvg(app, 'paper', 'p'), 32],
    ['favicon.png', suiteMarkSvg(app, 'tile', 't'), 32],
    ['icon-48.png', suiteMarkSvg(app, 'paper', 'p'), 48],
  ];
  for (const size of DEVICE_SIZES) out.push([`icon-${size}.png`, suiteMarkSvg(app, 'backdrop', 'b'), size]);
  for (const size of MASKABLE_SIZES) {
    out.push([`icon-maskable-${size}.png`, suiteMarkSvg(app, 'maskable', 'c'), size]);
    out.push([`icon-dark-${size}.png`, darkIconSvg(app), size]);
  }
  return out;
}
