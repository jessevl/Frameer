/**
 * @file SelectionPill.test.tsx
 * @description The selection pill: the count and its clear button, the actions as named buttons that call back, toggles that show aria-pressed, disabled and danger actions, the app's own nodes in the row, nothing when the count is zero, 44 px targets on a phone, and accessibility.
 */
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import SelectionPill from './SelectionPill';

const icon = <span aria-hidden="true">i</span>;

function pill(over: Partial<ComponentProps<typeof SelectionPill>> = {}) {
  const onClear = vi.fn();
  const onStar = vi.fn();
  const onTrash = vi.fn();
  const view = render(
    <SelectionPill
      count={3}
      onClear={onClear}
      actions={[
        { id: 'star', label: 'Star', icon, pressed: true, onClick: onStar },
        { id: 'move', label: 'Move', icon, disabled: true },
        { id: 'menu', label: 'Menu', node: <button type="button">Own menu</button> },
        { id: 'trash', label: 'Trash', icon, danger: true, ruleBefore: true, onClick: onTrash },
      ]}
      {...over}
    />,
  );
  return { ...view, onClear, onStar, onTrash };
}

describe('SelectionPill', () => {
  it('shows the count and clears', () => {
    const { onClear } = pill();
    expect(screen.getByRole('status', { name: '3 selected' })).toHaveTextContent('3');
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('draws nothing for an empty selection', () => {
    pill({ count: 0 });
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('calls an action, shows its toggle and disabled state, and keeps the apps own node', () => {
    const { onStar, onTrash } = pill();
    expect(screen.getByRole('button', { name: 'Star' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Move' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Own menu' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Star' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trash' }));
    expect(onStar).toHaveBeenCalledTimes(1);
    expect(onTrash).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Trash' }).className).toContain('--coral-ink');
  });

  it('is a named toolbar with 44 px targets on a phone and no violations', async () => {
    const { container } = pill();
    expect(screen.getByRole('toolbar', { name: 'Selection actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Star' }).className).toContain('max-md:h-11');
    expect(screen.getByRole('button', { name: 'Clear selection' }).className).toContain('max-md:w-11');
    expect(await axeViolations(container)).toEqual([]);
  });
});
