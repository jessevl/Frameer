/**
 * @file chromeGlyphs.test.tsx
 * @description The line-style chrome glyphs: each draws one 24 px SVG that assistive technology skips, takes size, class and stroke width, is a chrome icon name, and replaces Lucide when given to ChromeIconsProvider; plus the Lucide defaults of the new names; axe.
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
    expect(svg).toHaveAttribute('stroke-width', '2');
    expect(svg).toHaveClass('h-4');
    expect(svg?.querySelector('path, rect')).not.toBeNull();
  });

  it('replaces Lucide through the provider', () => {
    const { container } = render(
      <ChromeIconsProvider icons={chromeGlyphs}>
        <ChromeIcon name="logOut" />
      </ChromeIconsProvider>,
    );
    expect(container.querySelector('svg')).toHaveAttribute('data-chrome', 'logOut');
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '1.7');
  });

  it('draws the new names in Lucide without a provider', () => {
    const { container } = render(
      <>
        {NAMES.map((name) => (
          <ChromeIcon key={name} name={name} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg[data-chrome]')).toHaveLength(NAMES.length);
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
