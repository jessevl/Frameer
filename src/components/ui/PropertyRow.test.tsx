/**
 * @file PropertyRow.test.tsx
 * @description The property row, grid, section and add chip: label and value, the tone of the icon, a button row that calls back, two values in a grid, the section's heading, the chip as a named button, and accessibility.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import { PropertyRow, PropertyGrid } from './PropertyRow';
import { PanelSection, AddChip } from './PanelSection';

const icon = <svg data-testid="mark" />;

describe('PropertyRow', () => {
  it('shows the label and the value, with a test id from the label', () => {
    render(<PropertyRow icon={icon} label="Calendar">Family</PropertyRow>);
    const row = screen.getByTestId('prop-calendar');
    expect(row).toHaveTextContent('Calendar');
    expect(row).toHaveTextContent('Family');
  });

  it('colors the icon coral by default and grey with tone="grey"', () => {
    const { rerender } = render(<PropertyRow icon={icon} label="Where">Home</PropertyRow>);
    expect(screen.getByTestId('mark').parentElement?.style.color).toBe('var(--coral)');
    rerender(<PropertyRow icon={icon} label="Where" tone="grey">Home</PropertyRow>);
    expect(screen.getByTestId('mark').parentElement?.style.color).toBe('var(--ink-2)');
  });

  it('is one button when it has onClick', () => {
    const onClick = vi.fn();
    render(<PropertyRow icon={icon} label="Repeat" onClick={onClick}>Weekly</PropertyRow>);
    fireEvent.click(screen.getByRole('button', { name: /Repeat/ }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('lays two values across the grid, or one across both columns', async () => {
    const { container } = render(
      <PropertyGrid>
        <PropertyRow icon={icon} label="Day" second="10:00">Mon</PropertyRow>
        <PropertyRow icon={icon} label="Where">Home</PropertyRow>
      </PropertyGrid>,
    );
    expect((container.firstElementChild as HTMLElement).style.gridTemplateColumns).toBe('88px 1fr 1fr');
    const day = screen.getByTestId('prop-day');
    expect(day.children).toHaveLength(3);
    expect(screen.getByTestId('prop-where').children[1]).toHaveClass('col-span-2');
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('PanelSection and AddChip', () => {
  it('names the section by its title and holds the chip as a button', async () => {
    const onAdd = vi.fn();
    const { container } = render(
      <PanelSection title="Guests">
        <AddChip label="Add guest" onClick={onAdd} />
      </PanelSection>,
    );
    expect(screen.getByRole('region', { name: 'Guests' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Guests', level: 3 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add guest' }));
    expect(onAdd).toHaveBeenCalledOnce();
    expect(await axeViolations(container)).toEqual([]);
  });
});
