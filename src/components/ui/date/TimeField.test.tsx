/**
 * @file TimeField.test.tsx
 * @description The time field and the time range: typed times settling on blur, the unreadable value, the list of steps and its keys, lengths from the start, min, the range keeping its length, and accessibility.
 */
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../../../test/axe';
import { TimeField, type TimeFieldProps } from './TimeField';
import { TimeRangeFields, moveRangeEnd, moveRangeStart, type TimeRange } from './TimeRangeFields';

function Field(props: Partial<TimeFieldProps>) {
  const [value, setValue] = useState<string | null>(props.value === undefined ? '09:00' : props.value);
  return (
    <TimeField
      label="Start"
      {...props}
      value={value}
      onChange={(t) => {
        setValue(t);
        props.onChange?.(t);
      }}
    />
  );
}

const input = () => screen.getByRole('combobox', { name: 'Start' });
const type = (text: string) => {
  fireEvent.change(input(), { target: { value: text } });
  fireEvent.blur(input());
};

describe('TimeField', () => {
  it.each([
    ['830', '08:30'],
    ['8pm', '20:00'],
    ['8.30', '08:30'],
    ['17:45', '17:45'],
  ])('settles %j on blur as %s', (text, time) => {
    const onChange = vi.fn();
    render(<Field onChange={onChange} />);
    type(text);
    expect(onChange).toHaveBeenCalledWith(time);
    expect(input()).toHaveValue(time);
  });

  it('says so under the field when it cannot read the value, and keeps the old value', () => {
    const onChange = vi.fn();
    render(<Field onChange={onChange} />);
    type('lunch');
    expect(onChange).not.toHaveBeenCalled();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAccessibleDescription('Type a time such as 8:30 or 8pm.');
    expect(screen.getByRole('alert')).toHaveTextContent('Type a time such as 8:30 or 8pm.');
    type('10');
    expect(onChange).toHaveBeenCalledWith('10:00');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears when clearable and brings the value back when not', () => {
    const onChange = vi.fn();
    const { unmount } = render(<Field onChange={onChange} />);
    type('');
    expect(onChange).not.toHaveBeenCalled();
    expect(input()).toHaveValue('09:00');
    unmount();
    render(<Field clearable onChange={onChange} />);
    type('');
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('opens a list of steps scrolled to the value and picks one with a click', () => {
    const onChange = vi.fn();
    render(<Field step={30} onChange={onChange} />);
    fireEvent.click(input());
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(48);
    expect(screen.getByRole('option', { name: '09:00' })).toHaveAttribute('aria-selected', 'true');
    expect(input()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: '09:00' }).id);
    fireEvent.click(screen.getByRole('option', { name: '10:30' }));
    expect(onChange).toHaveBeenCalledWith('10:30');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('moves through the list with the arrows and takes the step with Enter', () => {
    const onChange = vi.fn();
    render(<Field onChange={onChange} />);
    input().focus();
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(screen.getByRole('listbox', { name: 'Start' })).toBeInTheDocument();
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(input()).toHaveValue('09:30');
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('09:30');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes only its list on Escape', () => {
    const outer = vi.fn();
    window.addEventListener('keydown', outer);
    render(<Field />);
    fireEvent.click(input());
    fireEvent.keyDown(input(), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(outer).not.toHaveBeenCalled();
    window.removeEventListener('keydown', outer);
  });

  it("starts the list at `from` and shows each step's length", () => {
    render(<Field from="08:00" value="09:30" />);
    fireEvent.click(input());
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('08:00 · 0 min');
    expect(options[6]).toHaveTextContent('09:30 · 1 h 30');
    expect(options[6]).toHaveAttribute('aria-selected', 'true');
  });

  it('leaves out steps before min and settles an earlier typed time on it', () => {
    const onChange = vi.fn();
    render(<Field min="12:00" value={null} onChange={onChange} />);
    fireEvent.click(input());
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('12:00');
    type('9');
    expect(onChange).toHaveBeenCalledWith('12:00');
  });

  it('has no accessibility violations, open or closed', async () => {
    render(<Field />);
    expect(await axeViolations()).toEqual([]);
    fireEvent.click(input());
    expect(await axeViolations()).toEqual([]);
  });
});

describe('TimeRangeFields', () => {
  it('keeps the length when From moves and never lets To end before From', () => {
    expect(moveRangeStart({ from: '09:00', to: '10:30' }, '13:00')).toEqual({ from: '13:00', to: '14:30' });
    expect(moveRangeStart({ from: '09:00', to: '10:30' }, '23:00')).toEqual({ from: '23:00', to: '23:59' });
    expect(moveRangeStart({ from: null, to: '10:30' }, '11:00')).toEqual({ from: '11:00', to: '11:00' });
    expect(moveRangeEnd({ from: '09:00', to: '10:30' }, '08:00')).toEqual({ from: '09:00', to: '09:00' });
    expect(moveRangeEnd({ from: '09:00', to: '10:30' }, '12:00')).toEqual({ from: '09:00', to: '12:00' });
  });

  it('moves To with From in the fields', () => {
    const onChange = vi.fn();
    function Range() {
      const [range, setRange] = useState<TimeRange>({ from: '09:00', to: '10:30' });
      return (
        <TimeRangeFields
          {...range}
          onChange={(r) => {
            setRange(r);
            onChange(r);
          }}
        />
      );
    }
    render(<Range />);
    const from = screen.getByRole('combobox', { name: 'From' });
    fireEvent.change(from, { target: { value: '1pm' } });
    fireEvent.blur(from);
    expect(onChange).toHaveBeenLastCalledWith({ from: '13:00', to: '14:30' });
    expect(screen.getByRole('combobox', { name: 'To' })).toHaveValue('14:30');
    const to = screen.getByRole('combobox', { name: 'To' });
    fireEvent.change(to, { target: { value: '11' } });
    fireEvent.blur(to);
    expect(onChange).toHaveBeenLastCalledWith({ from: '13:00', to: '13:00' });
  });
});
