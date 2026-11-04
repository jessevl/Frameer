/**
 * @file CalendarGrid.test.tsx
 * @description The month grid: labels, the keyboard (days, weeks, months, week ends), min and max, the year list and accessibility.
 */
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../../../test/axe';
import { CalendarGrid, type CalendarGridProps } from './CalendarGrid';

const TODAY = '2026-11-04';

function Grid(props: Partial<CalendarGridProps>) {
  const [value, setValue] = useState<string | null>(props.value ?? '2026-11-10');
  return (
    <CalendarGrid
      today={TODAY}
      {...props}
      value={value}
      onChange={(d) => {
        setValue(d);
        props.onChange?.(d);
      }}
    />
  );
}

const day = (name: string) => screen.getByRole('button', { name });
const focused = () => document.activeElement?.getAttribute('aria-label');

describe('CalendarGrid', () => {
  it('names the month, marks today and the chosen day, and starts weeks on Monday', () => {
    render(<Grid />);
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(day('Wednesday 4 November 2026')).toHaveAttribute('aria-current', 'date');
    expect(day('Tuesday 10 November 2026').parentElement).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('columnheader')[0]).toHaveAccessibleName('Monday');
    // One tab stop: the chosen day.
    expect(day('Tuesday 10 November 2026')).toHaveAttribute('tabindex', '0');
    expect(day('Wednesday 11 November 2026')).toHaveAttribute('tabindex', '-1');
  });

  it('moves by day, week, month and to the ends of the week with the keyboard, and chooses with Enter', () => {
    const onChange = vi.fn();
    render(<Grid onChange={onChange} autoFocus />);
    expect(focused()).toBe('Tuesday 10 November 2026');
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(focused()).toBe('Wednesday 11 November 2026');
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    expect(focused()).toBe('Wednesday 18 November 2026');
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(focused()).toBe('Monday 16 November 2026');
    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    expect(focused()).toBe('Sunday 22 November 2026');
    fireEvent.keyDown(document.activeElement as Element, { key: 'PageDown' });
    expect(focused()).toBe('Tuesday 22 December 2026');
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement as Element, { key: 'PageUp', shiftKey: true });
    expect(focused()).toBe('Monday 22 December 2025');
    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('2025-12-22');
  });

  it('crosses into the next month with the arrows', () => {
    render(<Grid value="2026-11-30" autoFocus />);
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(focused()).toBe('Tuesday 1 December 2026');
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeInTheDocument();
  });

  it('closes the days outside min and max and keeps the keyboard inside them', () => {
    const onChange = vi.fn();
    render(<Grid value="2026-11-04" min="2026-11-04" max="2026-11-20" onChange={onChange} autoFocus />);
    expect(day('Tuesday 3 November 2026')).toBeDisabled();
    expect(day('Saturday 21 November 2026')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowLeft' });
    expect(focused()).toBe('Wednesday 4 November 2026');
    fireEvent.keyDown(document.activeElement as Element, { key: 'PageDown' });
    expect(focused()).toBe('Friday 20 November 2026');
    fireEvent.click(day('Tuesday 3 November 2026'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('opens a list of years from the month title', () => {
    render(<Grid />);
    fireEvent.click(screen.getByRole('button', { name: 'November 2026' }));
    const years = screen.getByRole('group', { name: 'Years' });
    expect(years).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026', pressed: true })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: '1984' }));
    expect(screen.getByRole('grid', { name: 'November 1984' })).toBeInTheDocument();
    expect(focused()).toBe('Saturday 10 November 1984');
  });

  it('moves between months with the buttons and calls onMonthChange', () => {
    const onMonthChange = vi.fn();
    render(<Grid onMonthChange={onMonthChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeInTheDocument();
    expect(onMonthChange).toHaveBeenCalledWith('2026-12-01');
  });

  it('selects the ends of a range and draws marked days', () => {
    render(<Grid value={null} range={{ from: '2026-11-10', to: '2026-11-12' }} marked={(d) => d === '2026-11-20'} />);
    expect(day('Tuesday 10 November 2026').parentElement).toHaveAttribute('aria-selected', 'true');
    expect(day('Thursday 12 November 2026').parentElement).toHaveAttribute('aria-selected', 'true');
    expect(day('Wednesday 11 November 2026').parentElement).toHaveAttribute('aria-selected', 'false');
    expect(day('Friday 20 November 2026').querySelector('span[aria-hidden]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    render(<Grid />);
    expect(await axeViolations()).toEqual([]);
  });
});
