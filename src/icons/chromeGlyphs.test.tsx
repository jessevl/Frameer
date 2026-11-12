/**
 * @file chromeGlyphs.test.tsx
 * @description The chrome glyphs: each draws one Drift line drawing that assistive technology skips, takes size and class (the line weight is the set's), is a chrome icon name, and is the same drawing Frameer's chrome draws by default, given to ChromeIconsProvider or not; axe.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { ChromeIcon, ChromeIconsProvider, type ChromeIconName } from '../components/ui/ChromeIcons';
import { chromeGlyphs } from './chromeGlyphs';

const NAMES = Object.keys(chromeGlyphs) as ChromeIconName[];

describe('chromeGlyphs', () => {
  it('has the twelve glyphs Harbour drew', () => {
    expect(NAMES.sort()).toEqual(['check', 'chevronLeft', 'clearFormatting', 'close', 'copy', 'heading', 'indentLess', 'indentMore', 'logOut', 'numberedList', 'panelRight', 'redo']);
  });

  it.each(NAMES)('draws %s as one hidden line SVG', (name) => {
    const Glyph = chromeGlyphs[name];
    if (!Glyph) throw new Error(`no glyph ${name}`);
    const { container } = render(<Glyph className="h-4 w-4" size={16} strokeWidth={2} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveClass('h-4', 'gi-line', 'gi-inherit');
    expect(svg).toHaveAttribute('data-line');
    expect(svg?.innerHTML).not.toContain('stroke-width="2"');
  });

  it('draws the same line drawing through the provider as Frameer does without one', () => {
    for (const name of NAMES) {
      const given = render(
        <ChromeIconsProvider icons={chromeGlyphs}>
          <ChromeIcon name={name} />
        </ChromeIconsProvider>,
      ).container.querySelector('svg');
      const plain = render(<ChromeIcon name={name} />).container.querySelector('svg');
      expect(given).toHaveAttribute('data-chrome', name);
      expect(given?.getAttribute('data-line')).toBe(plain?.getAttribute('data-line'));
    }
  });

  it('has no axe violations', async () => {
    render(
      <button type="button" aria-label="Sign out">
        {chromeGlyphs.logOut ? <chromeGlyphs.logOut /> : null}
      </button>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
