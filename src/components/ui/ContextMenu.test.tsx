/**
 * @file ContextMenu.test.tsx
 * @description The context menu and useContextMenu: every way in (right click, long press, the Menu key, Shift+F10, a button), the keyboard inside (arrows that wrap, Home and End, a typed letter, Enter and Space, submenus), Escape returning the focus, checked and kept-open items, text fields keeping the browser's menu, the sheet on a phone, the older wrapper, and accessibility.
 */
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import ContextMenu, { ContextMenuContent, useContextMenu, type ContextMenuItem } from './ContextMenu';

const spies = { open: vi.fn(), reply: vi.fn(), archive: vi.fn(), del: vi.fn(), row: vi.fn() };

function baseItems(): ContextMenuItem[] {
  return [
    { id: 'open', label: 'Open', onClick: spies.open },
    { id: 'reply', label: 'Reply', hint: 'R', onClick: spies.reply },
    { id: 'archive', label: 'Archive', hint: 'E', divider: true, onClick: spies.archive },
    { id: 'delete', label: 'Delete', hint: 'Del', variant: 'danger', divider: true, onClick: spies.del },
  ];
}

function Row({ items = baseItems, withInput = false }: { items?: () => ContextMenuItem[]; withInput?: boolean }) {
  const menu = useContextMenu(items, { label: 'Actions for Dinner' });
  return (
    <>
      <div tabIndex={0} data-testid="row" data-open={menu.isOpen} onClick={spies.row} {...menu.triggerProps}>
        Dinner
        {withInput ? <input aria-label="Note" /> : null}
        <button type="button" aria-label="Actions for Dinner" aria-haspopup="menu" onClick={(e) => menu.open(e.currentTarget)}>
          …
        </button>
      </div>
      {menu.menu}
    </>
  );
}

const row = () => screen.getByTestId('row');
const menu = () => screen.getByRole('menu', { name: 'Actions for Dinner' });
const focusedName = () => document.activeElement?.textContent?.trim();
const key = (k: string, extra: object = {}) => fireEvent.keyDown(document.activeElement as Element, { key: k, ...extra });

const realMatchMedia = window.matchMedia;
afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  window.matchMedia = realMatchMedia;
});

describe('useContextMenu', () => {
  it('opens on a right click with the focus on the first item, and marks the row open', () => {
    render(<Row />);
    const event = fireEvent.contextMenu(row(), { clientX: 40, clientY: 50 });
    expect(event).toBe(false); // the browser's menu is held back
    expect(menu()).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveFocus();
    expect(row()).toHaveAttribute('data-open', 'true');
  });

  it('wraps with the arrows, jumps with Home, End and a typed letter', () => {
    render(<Row />);
    fireEvent.contextMenu(row());
    key('ArrowUp');
    expect(focusedName()).toMatch(/^Delete/);
    key('ArrowDown');
    expect(focusedName()).toBe('Open');
    key('End');
    expect(focusedName()).toMatch(/^Delete/);
    key('Home');
    expect(focusedName()).toBe('Open');
    key('a');
    expect(focusedName()).toMatch(/^Archive/);
  });

  it('chooses with Enter, closes and returns the focus to the row', () => {
    render(<Row />);
    row().focus();
    fireEvent.contextMenu(row());
    key('ArrowDown');
    key('Enter');
    expect(spies.reply).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(row()).toHaveFocus();
  });

  it('chooses with Space on key down only once', () => {
    render(<Row />);
    fireEvent.contextMenu(row());
    key(' ');
    fireEvent.keyUp(document.body, { key: ' ' });
    expect(spies.open).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape and returns the focus to where it was opened, without the host seeing the key', () => {
    const outer = vi.fn();
    window.addEventListener('keydown', outer);
    render(<Row />);
    const button = screen.getByRole('button', { name: 'Actions for Dinner' });
    fireEvent.click(button);
    expect(menu()).toBeInTheDocument();
    key('Escape');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
    expect(outer).not.toHaveBeenCalled();
    window.removeEventListener('keydown', outer);
    // The button's click did not reach the row.
    expect(spies.row).toHaveBeenCalledTimes(1);
  });

  it('opens with the Menu key and Shift+F10 on the focused row', () => {
    render(<Row />);
    row().focus();
    fireEvent.keyDown(row(), { key: 'ContextMenu' });
    expect(menu()).toBeInTheDocument();
    key('Escape');
    expect(row()).toHaveFocus();
    fireEvent.keyDown(row(), { key: 'F10', shiftKey: true });
    expect(menu()).toBeInTheDocument();
  });

  it('opens after a 500 ms long press and swallows the click that follows the lift', () => {
    vi.useFakeTimers();
    render(<Row />);
    fireEvent.touchStart(row(), { touches: [{ clientX: 10, clientY: 20 }] });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(menu()).toBeInTheDocument();
    fireEvent.touchEnd(row());
    fireEvent.click(row());
    expect(spies.row).not.toHaveBeenCalled();
  });

  it('does not open on a short tap or a moved finger', () => {
    vi.useFakeTimers();
    render(<Row />);
    fireEvent.touchStart(row(), { touches: [{ clientX: 10, clientY: 20 }] });
    fireEvent.touchMove(row(), { touches: [{ clientX: 60, clientY: 20 }] });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('leaves the browser its own menu in a text field and when there are no items', () => {
    const { unmount } = render(<Row withInput />);
    expect(fireEvent.contextMenu(screen.getByRole('textbox', { name: 'Note' }))).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    unmount();
    render(<Row items={() => []} />);
    expect(fireEvent.contextMenu(row())).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('draws headings, hints, radio and checkbox items, and keeps open items open with their checks following the state', () => {
    function People() {
      const [on, setOn] = useState<string[]>(['sam']);
      const toggle = (id: string) => setOn((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
      const menu = useContextMenu(() => [
        { id: 'all', label: 'All', heading: 'Show under', checked: true, onClick: () => {} },
        { id: 'family', label: 'Family', checked: false, onClick: () => {} },
        { id: 'sam', label: 'Sam', heading: 'For', checked: on.includes('sam'), checkbox: true, keepOpen: true, onClick: () => toggle('sam') },
        { id: 'kim', label: 'Kim', checked: on.includes('kim'), checkbox: true, keepOpen: true, onClick: () => toggle('kim') },
        { id: 'reply', label: 'Reply', hint: 'R', divider: true, onClick: () => {} },
      ], { label: 'Event' });
      return (
        <>
          <div data-testid="event" {...menu.triggerProps}>Event</div>
          {menu.menu}
        </>
      );
    }
    render(<People />);
    fireEvent.contextMenu(screen.getByTestId('event'));
    expect(screen.getByText('Show under')).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'All' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Family' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menuitem', { name: 'Reply' })).toHaveAttribute('aria-keyshortcuts', 'R');
    expect(screen.getByText('R')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Kim' }));
    expect(screen.getByRole('menu', { name: 'Event' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Kim' })).toHaveAttribute('aria-checked', 'true');
  });

  it('opens a submenu with Right and closes it with Left', () => {
    const who = vi.fn();
    render(
      <Row
        items={() => [
          { id: 'open', label: 'Open', onClick: () => {} },
          { id: 'who', label: 'Who does it', onClick: () => {}, children: [
            { id: 'sam', label: 'Sam', checked: true, onClick: () => who('sam') },
            { id: 'kim', label: 'Kim', checked: false, onClick: () => who('kim') },
          ] },
        ]}
      />,
    );
    fireEvent.contextMenu(row());
    key('ArrowDown');
    const parent = screen.getByRole('menuitem', { name: 'Who does it' });
    expect(parent).toHaveAttribute('aria-expanded', 'false');
    key('ArrowRight');
    expect(parent).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Sam' })).toHaveFocus();
    key('ArrowLeft');
    expect(parent).toHaveFocus();
    expect(screen.queryByRole('menuitemradio', { name: 'Sam' })).not.toBeInTheDocument();
    key('Enter');
    key('ArrowDown');
    key('Enter');
    expect(who).toHaveBeenCalledWith('kim');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens as a sheet with touch-sized rows on a phone', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    render(<Row />);
    fireEvent.contextMenu(row());
    expect(menu().className).toContain('bottom-0');
    expect(screen.getByRole('menuitem', { name: 'Open' }).className).toContain('h-11');
  });

  it('closes on a press outside', () => {
    render(<Row />);
    fireEvent.contextMenu(row());
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('has no accessibility violations when open', async () => {
    render(<Row items={() => [...baseItems(), { id: 'star', label: 'Star', checked: false, checkbox: true, onClick: () => {} }]} />);
    fireEvent.contextMenu(row());
    expect(await axeViolations()).toEqual([]);
  });
});

describe('ContextMenu (the wrapper)', () => {
  it('still opens on a right click and on a click with trigger="click"', () => {
    const { unmount } = render(
      <ContextMenu items={baseItems()}>
        <span>Thread</span>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Thread'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(spies.archive).toHaveBeenCalledTimes(1);
    unmount();
    render(
      <ContextMenu items={baseItems()} trigger="click" label="More">
        <button type="button">More</button>
      </ContextMenu>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByRole('menu', { name: 'More' })).toBeInTheDocument();
    key('Escape');
    expect(screen.getByRole('button', { name: 'More' })).toHaveFocus();
  });

  it('keeps ContextMenuContent usable on its own, with the older shortcut field', () => {
    const onItemClick = vi.fn();
    render(
      <div role="menu" aria-label="Own">
        <ContextMenuContent items={[{ id: 'rename', label: 'Rename', shortcut: 'F2', onClick: () => {} }]} onItemClick={onItemClick} />
      </div>,
    );
    expect(screen.getByText('F2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'rename' }));
  });
});

describe('menu size', () => {
  it('is one width whatever the labels say, so every menu in an app looks alike', () => {
    const short = () => [{ id: 'a', label: 'Open', onClick: vi.fn() }];
    const long = () => [{ id: 'a', label: 'Make an event from this mail with a very long name', onClick: vi.fn() }];
    const widths = [short, long].map((items) => {
      const { unmount } = render(<Row items={items} />);
      fireEvent.contextMenu(row());
      const cls = menu().className;
      unmount();
      return cls;
    });
    expect(widths[0]).toBe(widths[1]);
    expect(widths[0]).toContain('w-64');
    expect(widths[0]).not.toContain('min-w');
  });
});
