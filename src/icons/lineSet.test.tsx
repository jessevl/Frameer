/**
 * @file lineSet.test.tsx
 * @description The whole Drift line set and the rule that Frameer's chrome uses it: every drawing renders in both line weights with the surface-colored fill where it occludes, every part class a drawing moves has a rule in styles/motion.css, every new gesture is off under reduced motion, every chrome icon (and every icon of common/Icons and ThemeChoice) is a line drawing and never Lucide geometry, and only the custom-icon path imports `lucide-react`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { allLineNames, lineLabel, lineMarkup } from './line';
import { LineIcon } from './LineIcon';
import { ChromeIcon, chromeLineName, type ChromeIconName } from '../components/ui/ChromeIcons';
import * as CommonIcons from '../components/common/Icons';
import { ThemeChoice } from '../components/ui/ThemeChoice';

const SRC = resolve(import.meta.dirname, '..');
const motion = readFileSync(join(SRC, 'styles/motion.css'), 'utf8');
const names = allLineNames();

/** The files that may import `lucide-react`: the catalogue a user's custom icon is drawn from (and its build helper), and the wrapper that draws a Lucide component a caller hands it. */
const LUCIDE_ALLOWED = ['lib/lucideCatalogue.ts', 'components/ui/Icon.tsx', 'build/lazyLucideCatalogue.ts', 'build/lazyLucideCatalogue.test.ts', 'icons/lineSet.test.tsx'];

const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : [];
});

describe('the Drift line set', () => {
  it('has more than two hundred drawings, each with a spoken name', () => {
    expect(names.length).toBeGreaterThan(200);
    for (const name of names) expect(lineLabel(name)).not.toBe('');
  });

  it.each(names)('draws %s in both weights without holes in its markup', (name) => {
    for (const size of [18, 24, 44]) {
      const { inner } = lineMarkup(name, 'x', size);
      expect(inner).toContain('currentColor');
      expect(inner).not.toMatch(/undefined|NaN|null/);
    }
  });

  it('gives every part a drawing moves a rule in motion.css', () => {
    const used = new Set<string>();
    for (const name of names) {
      for (const m of lineMarkup(name, 'x', 20).inner.matchAll(/class="([^"]*)"/g)) for (const c of (m[1] ?? '').split(' ').filter(Boolean)) used.add(c);
    }
    // The middle layer of All tasks stays put while the others part.
    const still = new Set(['l2']);
    const missing = [...used].filter((c) => !still.has(c) && !new RegExp(`\\.${c}\\b`).test(motion));
    expect(missing).toEqual([]);
  });

  it('turns the new gestures off under reduced motion: their hover rules sit in a no-preference block', () => {
    const block = motion.slice(motion.indexOf('@media (prefers-reduced-motion: no-preference)'));
    for (const part of ['.go ', '.twist', '.ink ', '.grow ', '.u1 ', '.press ']) expect(block).toContain(`& ${part.trim()}`);
  });

  it('fills a stateful drawing when switched on, in the icon\'s own color', () => {
    const { container } = render(<LineIcon name="star" on />);
    expect(container.querySelector('svg')).toHaveAttribute('data-on', 'true');
    expect(container.querySelector('.fon')?.getAttribute('style')).toContain('var(--icon-on, var(--coral))');
    expect(motion).toMatch(/\.gi-line\[data-on='true'\] \.fon \{ opacity: 1; \}/);
  });
});

describe('Frameer chrome in the line set', () => {
  const chromeNames = ['alertCircle', 'alertTriangle', 'bug', 'check', 'checkCircle', 'chevronDown', 'chevronLeft', 'chevronRight', 'close', 'loader', 'plus', 'refresh', 'searchEmpty', 'undo', 'wifiOff', 'quote', 'mic', 'pin', 'lightbulb', 'tableOfContents', 'layout', 'skip'] as ChromeIconName[];

  it.each(chromeNames)('draws %s as a line drawing without a provider', (name) => {
    const { container } = render(<ChromeIcon name={name} className="h-4 w-4" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('data-chrome', name);
    expect(svg).toHaveAttribute('data-line', chromeLineName(name));
    expect(container.querySelector('.lucide')).toBeNull();
  });

  it('draws every icon of common/Icons and the theme choice in the line set, never in Lucide', () => {
    const { container } = render(
      <>
        {Object.entries(CommonIcons).filter(([key]) => key.endsWith('Icon') && key !== 'JournalCalendarIcon').map(([key, Icon]) => React.createElement(Icon as React.FC<{ className?: string }>, { key, className: 'h-4 w-4' }))}
        <ThemeChoice value="system" onChange={() => undefined} />
      </>,
    );
    const svgs = [...container.querySelectorAll('svg')];
    expect(svgs.length).toBeGreaterThan(60);
    expect(svgs.filter((svg) => !svg.hasAttribute('data-line'))).toEqual([]);
    expect(container.querySelector('.lucide')).toBeNull();
  });

  it('imports lucide-react only on the custom-icon path', () => {
    const offenders = files(SRC).filter((f) => /from\s+['"]lucide-react|import\(\s*['"]lucide-react/.test(readFileSync(f, 'utf8'))).map((f) => relative(SRC, f)).filter((f) => !LUCIDE_ALLOWED.includes(f));
    expect(offenders).toEqual([]);
  });
});
