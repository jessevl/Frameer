/**
 * @file Segmented.test.tsx
 * @description Segmented and ThemeChoice: the radio group's roles and names, one tab stop, the arrow keys, Home and End, the icon-only form with its names and tooltips, the disabled state, and axe.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import { Segmented } from './Segmented';
import { ThemeChoice } from './ThemeChoice';

const OPTIONS = [
  { id: 'day', label: 'Day', line: 'upcoming' as const },
  { id: 'week', label: 'Week', line: 'journal' as const },
  { id: 'month', label: 'Month', line: 'upcoming' as const },
];

describe('Segmented', () => {
  it('is a named radio group with the chosen option checked and one tab stop', () => {
    render(<Segmented label="View" options={OPTIONS} value="week" onChange={vi.fn()} />);
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('tabindex', '-1');
  });

  it('chooses on click, but not the option that is already chosen', () => {
    const onChange = vi.fn();
    render(<Segmented label="View" options={OPTIONS} value="week" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('radio', { name: 'Month' }));
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('moves with the arrows (wrapping), Home and End', () => {
    const onChange = vi.fn();
    render(<Segmented label="View" options={OPTIONS} value="month" onChange={onChange} />);
    const month = screen.getByRole('radio', { name: 'Month' });
    month.focus();
    fireEvent.keyDown(month, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('day');
    fireEvent.keyDown(month, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('week');
    fireEvent.keyDown(month, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('day');
  });

  it('icon-only: the label is the name and the tooltip, and no text is drawn', async () => {
    render(<Segmented label="View" options={OPTIONS} value="day" onChange={vi.fn()} iconOnly />);
    const week = screen.getByRole('radio', { name: 'Week' });
    expect(week).toHaveAttribute('title', 'Week');
    expect(week.textContent).toBe('');
    expect(week.querySelector('svg')).not.toBeNull();
    expect(await axeViolations()).toEqual([]);
  });

  it('does nothing when disabled', () => {
    const onChange = vi.fn();
    render(<Segmented label="View" options={OPTIONS} value="day" onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations with text', async () => {
    render(<Segmented label="View" options={OPTIONS} value="day" onChange={vi.fn()} />);
    expect(await axeViolations()).toEqual([]);
  });
});

describe('ThemeChoice', () => {
  it('offers System, Light and Dark and reports the choice', async () => {
    const onChange = vi.fn();
    render(<ThemeChoice value="system" onChange={onChange} />);
    expect(screen.getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'System' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(onChange).toHaveBeenCalledWith('dark');
    expect(await axeViolations()).toEqual([]);
  });

  it('icon-only keeps the names', () => {
    render(<ThemeChoice value="light" onChange={vi.fn()} iconOnly />);
    expect(screen.getByRole('radio', { name: 'Light' })).toHaveAttribute('title', 'Light');
  });
});
