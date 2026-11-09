/**
 * @file parts.test.tsx
 * @description The small parts: FactTag, StatusWord (always a word), GlyphTile sizes, Facts with any node as a value, the tick gauge (40 ticks, colour bands at 55 and 75, faded past the value, marker) and the steps (states, numbering, aria-current, the check).
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Fact, Facts } from './Facts';
import { FactTag } from './FactTag';
import { GlyphTile } from './GlyphTile';
import { StatusWord } from './StatusWord';
import { Step, Steps } from './Steps';
import { TickGauge } from './TickGauge';
import { TICKS, tickHue } from './tickScale';

describe('tags', () => {
  it('FactTag is an outline pill with its word', () => {
    render(<FactTag>ext4</FactTag>);
    expect(screen.getByText('ext4')).toHaveClass('fr-fact-tag');
  });
  it.each(['ok', 'warn', 'bad', 'quiet'] as const)('StatusWord %s always has a word and a decorative dot', (tone) => {
    const { container } = render(<StatusWord tone={tone}>Healthy</StatusWord>);
    expect(container.querySelector('.fr-status')).toHaveAttribute('data-tone', tone);
    expect(container.querySelector('.fr-status')).toHaveTextContent('Healthy');
    expect(container.querySelector('.fr-status-dot')).toHaveAttribute('aria-hidden', 'true');
  });
  it('GlyphTile has three sizes and hides from screen readers', () => {
    const { container } = render(
      <>
        <GlyphTile size={30}>a</GlyphTile>
        <GlyphTile>b</GlyphTile>
        <GlyphTile size={52}>c</GlyphTile>
      </>,
    );
    expect([...container.querySelectorAll('.fr-glyph')].map((e) => e.getAttribute('data-size'))).toEqual(['30', '40', '52']);
    expect(container.querySelector('.fr-glyph')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Facts', () => {
  it('lists label and value, the value any node', () => {
    render(
      <Facts>
        <Fact label="Model">WD Red</Fact>
        <Fact label="Health">
          <StatusWord tone="ok">Healthy</StatusWord>
        </Fact>
      </Facts>,
    );
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Model', 'Health']);
    expect(screen.getAllByRole('definition')[1]).toHaveTextContent('Healthy');
  });
});

describe('TickGauge', () => {
  it('colours green below 55, orange to 75, red above', () => {
    expect([0, 52.5, 55, 72.5, 75, 97.5].map(tickHue)).toEqual(['green', 'green', 'orange', 'orange', 'red', 'red']);
  });
  it('draws 40 ticks, fades the ones past the value and puts the marker there', () => {
    const { container } = render(<TickGauge value={50} />);
    const ticks = container.querySelectorAll('.fr-ticks i');
    expect(ticks).toHaveLength(TICKS);
    expect([...ticks].filter((t) => t.getAttribute('data-faded') === 'true')).toHaveLength(19);
    expect((container.querySelector('.fr-ticks b') as HTMLElement).style.left).toBe('50%');
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
  it('clamps the value', () => {
    const { container } = render(<TickGauge value={140} />);
    expect((container.querySelector('.fr-ticks b') as HTMLElement).style.left).toBe('100%');
  });
});

describe('Steps', () => {
  const ui = (
    <Steps label="Set up">
      <Step state="done" title="Pick the disk">
        a
      </Step>
      <Step state="current" title="Choose its use">
        b
      </Step>
      <Step state="todo" title="Format">
        c
      </Step>
    </Steps>
  );
  it('is an ordered list of steps with states, numbers and a check for done', () => {
    render(ui);
    expect(screen.getByRole('list', { name: 'Set up' }).tagName).toBe('OL');
    const items = screen.getAllByRole('listitem');
    expect(items.map((i) => i.getAttribute('data-state'))).toEqual(['done', 'current', 'todo']);
    expect(items[0]?.querySelector('svg')).not.toBeNull();
    expect(items[1]?.querySelector('.fr-step-rail i')).toHaveTextContent('2');
    expect(items[2]?.querySelector('.fr-step-rail i')).toHaveTextContent('3');
  });
  it('marks only the current step and says done in words', () => {
    render(ui);
    const items = screen.getAllByRole('listitem');
    expect(items.map((i) => i.getAttribute('aria-current'))).toEqual([null, 'step', null]);
    expect(items[0]).toHaveTextContent('Done: Pick the disk');
  });
});
