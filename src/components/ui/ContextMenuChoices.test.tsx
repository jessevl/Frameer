/**
 * @file ContextMenuChoices.test.tsx
 * @description The `choices` item of the context menu and the `line` icon: roles and names of the options, the coral ring on the chosen one, the menu staying open for several choices and closing for one, Up and Down treating a row as one stop, Left and Right moving between options, Enter and Space toggling, tooltips, and axe.
 */
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import { ContextMenuContent, useContextMenu, type ContextMenuItem } from './ContextMenu';

const key = (k: string) => fireEvent.keyDown(document.activeElement as Element, { key: k });

const people = [
  { id: 'mara', label: 'Mara', hue: 'teal' as const },
  { id: 'sam', label: 'Sam', hue: 'blue' as const },
  { id: 'kim', label: 'Kim Vos', hue: 'pink' as const, initials: 'KV' },
];

function Host({ multiple, onClose }: { multiple: boolean; onClose?: () => void }) {
  const [on, setOn] = useState<string[]>(['sam']);
  const toggle = (id: string) => setOn((cur) => (multiple ? (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]) : [id]));
  const menu = useContextMenu(
    (): ContextMenuItem[] => [
      { id: 'open', label: 'Open', line: 'upcoming', onClick: vi.fn() },
      { id: 'for', label: 'For', onClick: vi.fn(), choices: { kind: 'avatar', multiple, options: people.map((p) => ({ ...p, on: on.includes(p.id) })), onToggle: toggle } },
      { id: 'color', label: 'Color', onClick: vi.fn(), choices: { kind: 'swatch', multiple: false, options: [{ id: 'sage', label: 'Sage', hue: 'green', on: true }, { id: 'sky', label: 'Sky', hue: 'blue', on: false }], onToggle: vi.fn() } },
      { id: 'delete', label: 'Delete', variant: 'danger', onClick: onClose ?? vi.fn() },
    ],
    { label: 'Actions' },
  );
  return (
    <>
      <div tabIndex={0} data-testid="row" {...menu.triggerProps}>
        Row
      </div>
      {menu.menu}
    </>
  );
}

const open = () => fireEvent.contextMenu(screen.getByTestId('row'));

describe('choices', () => {
  it('draws options as radios or checkboxes with names, tooltips and a ring on the chosen one', () => {
    render(<Host multiple />);
    open();
    const sam = screen.getByRole('menuitemcheckbox', { name: 'Sam' });
    expect(sam).toHaveAttribute('aria-checked', 'true');
    expect(sam).toHaveAttribute('title', 'Sam');
    expect(sam.className).toContain('ring-[var(--coral)]');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Mara' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Mara' }).className).not.toContain('ring-[var(--coral)]');
    expect(screen.getByRole('menuitemradio', { name: 'Sage' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('group', { name: 'For' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Kim Vos' }).textContent).toBe('KV');
  });

  it('keeps the menu open and toggles for several choices', () => {
    render(<Host multiple />);
    open();
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Mara' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Mara' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Sam' })).toHaveAttribute('aria-checked', 'true');
  });

  it('closes the menu after a single choice', () => {
    render(<Host multiple={false} />);
    open();
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Mara' }));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('keeps a single choice open when the item says keepOpen', () => {
    const onToggle = vi.fn();
    const items: ContextMenuItem[] = [{ id: 'who', label: 'Who', onClick: vi.fn(), keepOpen: true, choices: { kind: 'avatar', multiple: false, options: people.map((p) => ({ ...p, on: false })), onToggle } }];
    const onItemClick = vi.fn();
    render(<ContextMenuContent items={items} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Sam' }));
    expect(onToggle).toHaveBeenCalledWith('sam');
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'who', keepOpen: true }));
  });

  it('treats a row as one stop for Up and Down and moves between options with Left and Right', () => {
    render(<Host multiple />);
    open();
    expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveFocus();
    key('ArrowDown');
    // The chosen option is the row's stop.
    expect(screen.getByRole('menuitemcheckbox', { name: 'Sam' })).toHaveFocus();
    key('ArrowRight');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Kim Vos' })).toHaveFocus();
    key('ArrowRight');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Mara' })).toHaveFocus();
    key('ArrowLeft');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Kim Vos' })).toHaveFocus();
    key('ArrowDown');
    expect(screen.getByRole('menuitemradio', { name: 'Sage' })).toHaveFocus();
    key('ArrowDown');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    key('ArrowUp');
    key('ArrowUp');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Sam' })).toHaveFocus();
  });

  it('toggles with Enter and Space', () => {
    render(<Host multiple />);
    open();
    key('ArrowDown');
    key('ArrowRight');
    key('Enter');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Kim Vos' })).toHaveAttribute('aria-checked', 'true');
    key(' ');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Kim Vos' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('draws a line icon in the row of an item with `line`', () => {
    render(<Host multiple />);
    open();
    expect(screen.getByRole('menuitem', { name: 'Open' }).querySelector('svg[data-line="upcoming"]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    render(<Host multiple />);
    open();
    expect(await axeViolations()).toEqual([]);
  });
});
