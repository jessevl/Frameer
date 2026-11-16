/**
 * @file suiteMark.test.ts
 * @description The six suite marks: every app draws every variant, ids stay apart per prefix, the moving part carries its class, and the favicon switches between the tile and the paper card by colour scheme.
 */
import { describe, expect, it } from 'vitest';
import { suiteMarkSvg, suiteVariantForSize, SUITE_MARKS, type SuiteApp, type SuiteVariant } from './suiteMark.ts';

const APPS = Object.keys(SUITE_MARKS) as SuiteApp[];
const VARIANTS: SuiteVariant[] = ['full', 'backdrop', 'maskable', 'paper', 'tile', 'favicon', 'mono'];

describe('suiteMarkSvg', () => {
  it.each(APPS)('%s draws every variant as one svg document', (app) => {
    for (const v of VARIANTS) {
      const svg = suiteMarkSvg(app, v, 'x');
      expect(svg.startsWith('<svg ')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(svg).toContain('class="sm sm-');
    }
  });

  it.each(APPS)('%s has a moving part', (app) => {
    expect(suiteMarkSvg(app, 'full', 'x')).toContain('class="m1"');
  });

  it('keeps sheets only for the apps that hold many of something', () => {
    const withSheets = APPS.filter((a) => SUITE_MARKS[a].sheets);
    expect(withSheets.sort()).toEqual(['drift', 'lighthouse', 'reel', 'yard']);
  });

  it('prefixes every gradient id so two marks on a page never share one', () => {
    const ids = (svg: string) => [...svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    const a = ids(suiteMarkSvg('drift', 'full', 'a'));
    const b = ids(suiteMarkSvg('drift', 'full', 'b'));
    expect(a.filter((id) => b.includes(id))).toEqual([]);
  });

  it('is decorative with an empty label and named otherwise', () => {
    expect(suiteMarkSvg('reel', 'paper', 'x', { label: '' })).toContain('aria-hidden="true"');
    expect(suiteMarkSvg('reel', 'paper', 'x')).toContain('aria-label="Reel"');
  });

  it('switches the favicon between tile and paper by colour scheme', () => {
    const svg = suiteMarkSvg('harbour', 'favicon', 'x');
    expect(svg).toContain('prefers-color-scheme:dark');
    expect(svg).toContain('class="ft"');
    expect(svg).toContain('class="fp"');
  });

  it('picks the glass card from 48 px and the flat card below', () => {
    expect(suiteVariantForSize(48)).toBe('full');
    expect(suiteVariantForSize(38)).toBe('paper');
  });
});

describe('suiteIconFiles', () => {
  it('lists every svg and png an app ships', async () => {
    const { suiteIconSvgs, suiteIconPngs } = await import('./suiteIconFiles.ts');
    expect(Object.keys(suiteIconSvgs('yard'))).toContain('favicon.svg');
    const names = suiteIconPngs('yard').map(([f]) => f);
    expect(names).toEqual(expect.arrayContaining(['icon-16.png', 'icon-32.png', 'favicon.png', 'icon-48.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-dark-512.png']));
  });
});
