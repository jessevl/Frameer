/**
 * @file DateField.test.tsx
 * @description The date field, the date range and the date-and-time field: labels, the popover and its keyboard, quick days, Clear, the range keeping its length, the sheet on a phone, and accessibility.
 */
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axeViolations } from '../../../test/axe';
import { DateField, type DateFieldProps } from './DateField';
import { DateRangeFields, moveDateRangeStart, type DateRange } from './DateRangeFields';
import { DateTimeField, type DateTimeValue } from './DateTimeField';

const TODAY = '2026-11-04';

function Field(props: Partial<DateFieldProps>) {
  const [value, setValue] = useState<string | null>(props.value === undefined ? '2026-11-10' : props.value);
  return (
    <DateField
      label="Day"
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

const realMatchMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = realMatchMedia;
});

describe('DateField', () => {
  it('reads the day short, with its label, and the year when it is not this year', () => {
    const { rerender } = render(<DateField label="Day" today={TODAY} value="2026-11-10" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Day Tue 10 Nov' })).toBeInTheDocument();
    rerender(<DateField label="Day" today={TODAY} value="2027-01-05" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Day Tue 5 Jan 2027' })).toBeInTheDocument();
    rerender(<DateField label="Day" today={TODAY} value={null} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Day Choose a day' })).toBeInTheDocument();
  });

  it('opens the grid on the chosen day, picks a day, closes and gives the focus back', () => {
    const onChange = vi.fn();
    render(<Field onChange={onChange} />);
    const field = screen.getByRole('button', { name: /^Day/ });
    fireEvent.click(field);
    const dialog = screen.getByRole('dialog', { name: 'Day' });
    expect(field).toHaveAttribute('aria-expanded', 'true');
    expect(document.activeElement).toHaveAccessibleName('Tuesday 10 November 2026');
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('2026-11-11');
    expect(dialog).not.toBeInTheDocument();
    expect(field).toHaveFocus();
    expect(field).toHaveAccessibleName('Day Wed 11 Nov');
  });

  it('closes on Escape without a change and returns the focus to the field', () => {
    const onChange = vi.fn();
    const outer = vi.fn();
    window.addEventListener('keydown', outer);
    render(<Field onChange={onChange} />);
    const field = screen.getByRole('button', { name: /^Day/ });
    fireEvent.click(field);
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(field).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    // Escape belonged to the popover: the panel hosting the field did not see it.
    expect(outer).not.toHaveBeenCalled();
    window.removeEventListener('keydown', outer);
  });

  it('offers Today, Tomorrow and Next Monday, and Clear when clearable', () => {
    const onChange = vi.fn();
    render(<Field quick clearable onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /^Day/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Next Monday' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-11-09');
    fireEvent.click(screen.getByRole('button', { name: /^Day/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Tomorrow' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-11-05');
    fireEvent.click(screen.getByRole('button', { name: /^Day/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('closes quick days outside min and max', () => {
    render(<Field quick min="2026-11-05" />);
    fireEvent.click(screen.getByRole('button', { name: /^Day/ }));
    expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tomorrow' })).toBeEnabled();
  });

  it('opens as a sheet on a phone', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    render(<Field />);
    fireEvent.click(screen.getByRole('button', { name: /^Day/ }));
    expect(screen.getByRole('dialog', { name: 'Day' }).className).toContain('bottom-0');
  });

  it('has no accessibility violations, open or closed', async () => {
    render(<Field quick clearable />);
    expect(await axeViolations()).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: /^Day/ }));
    expect(await axeViolations()).toEqual([]);
  });
});

describe('DateRangeFields', () => {
  function Range({ onChange }: { onChange?: (r: DateRange) => void }) {
    const [range, setRange] = useState<DateRange>({ from: '2026-11-10', to: '2026-11-12' });
    return (
      <DateRangeFields
        {...range}
        today={TODAY}
        onChange={(r) => {
          setRange(r);
          onChange?.(r);
        }}
      />
    );
  }

  it('keeps the length of the range when From moves', () => {
    expect(moveDateRangeStart({ from: '2026-11-10', to: '2026-11-12' }, '2026-11-30')).toEqual({ from: '2026-11-30', to: '2026-12-02' });
    expect(moveDateRangeStart({ from: null, to: '2026-11-12' }, '2026-11-20')).toEqual({ from: '2026-11-20', to: '2026-11-20' });
    expect(moveDateRangeStart({ from: '2026-11-10', to: null }, '2026-11-20')).toEqual({ from: '2026-11-20', to: null });
  });

  it('shares one grid: picking From moves To with it and goes on to To, which cannot end before From', () => {
    const onChange = vi.fn();
    render(<Range onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /^From/ }));
    const from = screen.getByRole('dialog', { name: 'From' });
    expect(within(from).getByRole('button', { name: 'Thursday 12 November 2026' }).parentElement).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(within(from).getByRole('button', { name: 'Monday 16 November 2026' }));
    expect(onChange).toHaveBeenLastCalledWith({ from: '2026-11-16', to: '2026-11-18' });
    const to = screen.getByRole('dialog', { name: 'To' });
    expect(within(to).getByRole('button', { name: 'Sunday 15 November 2026' })).toBeDisabled();
    fireEvent.click(within(to).getByRole('button', { name: 'Friday 20 November 2026' }));
    expect(onChange).toHaveBeenLastCalledWith({ from: '2026-11-16', to: '2026-11-20' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^To/ })).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    render(<Range />);
    expect(await axeViolations()).toEqual([]);
  });
});

describe('DateTimeField', () => {
  it('reports a moment only once both halves are set, and holds the time at min on its day', () => {
    const onChange = vi.fn();
    function Moment() {
      const [value, setValue] = useState<DateTimeValue | null>(null);
      return (
        <DateTimeField
          label="Send at"
          today={TODAY}
          value={value}
          min={{ date: TODAY, time: '14:00' }}
          onChange={(v) => {
            setValue(v);
            onChange(v);
          }}
        />
      );
    }
    render(<Moment />);
    expect(screen.getByRole('group', { name: 'Send at' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Day/ }));
    expect(screen.getByRole('button', { name: 'Tuesday 3 November 2026' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Wednesday 4 November 2026' }));
    expect(onChange).not.toHaveBeenCalled();
    const time = screen.getByRole('combobox', { name: 'Time' });
    fireEvent.change(time, { target: { value: '9am' } });
    fireEvent.blur(time);
    expect(onChange).toHaveBeenLastCalledWith({ date: '2026-11-04', time: '14:00' });
    fireEvent.click(screen.getByRole('button', { name: /^Day/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Thursday 5 November 2026' }));
    expect(onChange).toHaveBeenLastCalledWith({ date: '2026-11-05', time: '14:00' });
  });
});
