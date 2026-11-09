/**
 * @file SegmentBar.test.tsx
 * @description SegmentBar, DotMeter and FreePill: the meter's values and sr-only description, a focusable segment per part sized by its share in its own colour, hover and focus through onActive, the dots (one per 5%, at least one per segment, 20 at most) and the pill's words and levels.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DotMeter } from './DotMeter';
import { dotCells } from './dotCells';
import { FreePill } from './FreePill';
import { SegmentBar, type BarSegment } from './SegmentBar';

const segs: BarSegment[] = [
  { id: 'a', label: 'Apps', value: 30, color: 'red' },
  { id: 'f', label: 'Files', value: 240, color: 'blue' },
];
const fmt = (v: number) => `${v} MB`;

describe('SegmentBar', () => {
  it('is a meter with the used value and a description listing every segment', () => {
    render(<SegmentBar segments={segs} total={800} format={fmt} label="Space used" />);
    const meter = screen.getByRole('meter', { name: 'Space used' });
    expect(meter).toHaveAttribute('aria-valuenow', '270');
    expect(meter).toHaveAttribute('aria-valuemax', '800');
    const description = document.getElementById(meter.getAttribute('aria-describedby') ?? '');
    expect(description).toHaveTextContent('Apps 30 MB, Files 240 MB');
    expect(description).toHaveClass('sr-only');
  });
  it('draws a focusable segment per part sized by its share, and the room left as dots', () => {
    const { container } = render(<SegmentBar segments={[...segs, { id: 'z', label: 'Zero', value: 0, color: 'green' }]} total={800} height={14} format={fmt} level="watch" />);
    const parts = screen.getAllByTestId('bar-segment');
    expect(parts.map((p) => p.getAttribute('aria-label'))).toEqual(['Apps: 30 MB', 'Files: 240 MB']);
    expect(parts[1]).toHaveAttribute('tabindex', '0');
    expect((parts[1] as HTMLElement).style.width).toBe('30%');
    expect((parts[1] as HTMLElement).style.background).toBe('blue');
    expect(container.querySelector('.fr-free')).not.toBeNull();
    const meter = container.querySelector('[role="meter"]') as HTMLElement;
    expect(meter.style.height).toBe('14px');
    expect(meter).toHaveAttribute('data-level', 'watch');
  });
  it('grows the meter max when the parts exceed the total', () => {
    render(<SegmentBar segments={segs} total={100} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuemax', '270');
  });
  it('reports the segment under hover or focus and null when it leaves', () => {
    const onActive = vi.fn();
    render(<SegmentBar segments={segs} total={800} format={fmt} onActive={onActive} />);
    const files = screen.getByLabelText('Files: 240 MB');
    fireEvent.mouseEnter(files);
    expect(onActive).toHaveBeenLastCalledWith(segs[1]);
    fireEvent.mouseLeave(files);
    expect(onActive).toHaveBeenLastCalledWith(null);
    fireEvent.focus(files);
    expect(onActive).toHaveBeenLastCalledWith(segs[1]);
    fireEvent.blur(files);
    expect(onActive).toHaveBeenLastCalledWith(null);
  });
  it('has no description when empty', () => {
    render(<SegmentBar segments={[]} total={800} />);
    expect(screen.getByRole('meter')).not.toHaveAttribute('aria-describedby');
  });
});

describe('dotCells', () => {
  it('gives a dot per 5% in order and pads with free dots', () => {
    const cells = dotCells([{ color: 'a', value: 10 }, { color: 'b', value: 30 }], 100);
    expect(cells).toHaveLength(20);
    expect(cells.filter((c) => c === 'a')).toHaveLength(2);
    expect(cells.filter((c) => c === 'b')).toHaveLength(6);
    expect(cells.filter((c) => c === null)).toHaveLength(12);
    expect(cells.slice(0, 2)).toEqual(['a', 'a']);
  });
  it('shows at least one dot for a segment with a value, and never more than 20', () => {
    expect(dotCells([{ color: 'a', value: 100 }, { color: 'o', value: 1 }], 1000).filter((c) => c === 'o')).toHaveLength(1);
    expect(dotCells([{ color: 'a', value: 100 }, { color: 'o', value: 100 }], 100)).toHaveLength(20);
  });
});

describe('DotMeter', () => {
  it('renders 20 decorative dots, the used ones in their colour', () => {
    const { container } = render(<DotMeter segments={[{ color: 'teal', value: 50 }]} total={100} />);
    expect(container.querySelectorAll('.fr-dots i')).toHaveLength(20);
    expect(container.querySelectorAll('.fr-dots i[data-filled="true"]')).toHaveLength(10);
    expect((container.querySelector('.fr-dots i') as HTMLElement).style.background).toBe('teal');
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('FreePill', () => {
  it('says what is free and the size in words', () => {
    render(<FreePill segments={[{ color: 'teal', value: 5 }]} total={8} free="2.7 TB" size="8 TB" />);
    expect(screen.getByText('2.7 TB').tagName).toBe('B');
    expect(screen.getByText('/ 8 TB').tagName).toBe('EM');
    expect(screen.getByText(/free/)).toBeInTheDocument();
  });
  it('carries its level', () => {
    const { container, rerender } = render(<FreePill segments={[]} total={8} free="1" size="8" />);
    expect(container.firstElementChild).toHaveAttribute('data-level', 'normal');
    rerender(<FreePill segments={[]} total={8} free="1" size="8" level="critical" />);
    expect(container.firstElementChild).toHaveAttribute('data-level', 'critical');
  });
});
