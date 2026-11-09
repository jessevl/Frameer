/**
 * @file Facts.test.tsx
 * @description Facts: the rows render label and value, and the row's style keeps the label's width and a gap so a wide value cannot run into it.
 */
import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Fact, Facts } from './Facts';

describe('Facts', () => {
  it('renders a label and a value node per row', () => {
    render(
      <Facts>
        <Fact label="Temperature">
          <span>37 °C</span>
        </Fact>
      </Facts>,
    );
    expect(screen.getByText('Temperature').tagName).toBe('DT');
    expect(screen.getByText('37 °C').closest('dd')).not.toBeNull();
  });

  it('gives the row a gap and lets the label keep its width', () => {
    const css = readFileSync(new URL('../../styles/parts.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.fr-fact-row \{[^}]*gap: 12px/);
    expect(css).toMatch(/\.fr-fact-row dt \{[^}]*flex: 1 0 auto/);
  });
});
