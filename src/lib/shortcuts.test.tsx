/**
 * @file shortcuts.test.tsx
 * @description The shortcut registry on a small keymap: a single key runs only with a handler, a pending leader takes the next key, nothing fires while typing, in menus and grids, on a data-key block, with Alt or a plain Ctrl/Cmd, when prevented or for Shift+arrows; a `mod` chord fires, and one marked `inFields` also from a plain field but not from a dialog or an editor; the newest handler wins; `useShortcut` and `useListener` run handlers, honour `enabled` and the leader window; and the sheet and list show the keymap, with axe.
 */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { ShortcutList, ShortcutSheet } from '../components/ui/ShortcutSheet';
import { createShortcuts, shortcutRows, type KeyInput, type Shortcut } from './shortcuts';

type Scope = 'global' | 'mail' | 'mail.thread';

const KEYMAP: readonly Shortcut<Scope>[] = [
  { id: 'help', scope: 'global', keys: ['?'], label: 'This list' },
  { id: 'palette', scope: 'global', keys: ['k'], mod: true, inFields: true, show: ['Ctrl+K'], label: 'Search and commands', group: 'Everywhere' },
  { id: 'go.m', scope: 'global', keys: ['g', 'm'], label: 'Go to Mail' },
  { id: 'go.e', scope: 'global', keys: ['g', 'e'], label: 'Go to Meals' },
  { id: 'mail.archive', scope: 'mail.thread', keys: ['e'], label: 'Mail: archive', group: 'Mail' },
  { id: 'mail.prev', scope: 'mail', keys: ['k'], label: 'Mail: previous thread', group: 'Mail' },
  { id: 'mail.selectAll', scope: 'mail', keys: ['a'], mod: true, label: 'Mail: select all' },
  { id: 'mail.left', scope: 'mail', keys: ['ArrowLeft'], show: ['←'], label: 'Mail: back' },
];

const registry = createShortcuts(KEYMAP);
const ALL = new Set(KEYMAP.map((s) => s.id));

function key(k: string, extra: Partial<KeyInput> = {}): KeyInput {
  return { key: k, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, defaultPrevented: false, target: document.body, ...extra };
}
const idle = { pending: false, active: ALL };

/** Elements the tests add to the page; removed after each test (not the whole body, which would take the render containers and the modal portal with it). */
const tracked: HTMLElement[] = [];
function track<T extends HTMLElement>(el: T): T {
  tracked.push(el);
  return document.body.appendChild(el);
}

afterEach(() => {
  tracked.splice(0).forEach((el) => el.remove());
  vi.useRealTimers();
});

describe('resolve', () => {
  it('runs a single key whose handler exists, and nothing else', () => {
    expect(registry.resolve(key('e'), idle)).toEqual({ kind: 'run', id: 'mail.archive' });
    expect(registry.resolve(key('e'), { pending: false, active: new Set() })).toEqual({ kind: 'none' });
  });

  it('g e jumps and never reaches the single e', () => {
    expect(registry.resolve(key('g'), idle)).toEqual({ kind: 'pending' });
    expect(registry.resolve(key('e'), { pending: true, active: ALL })).toEqual({ kind: 'run', id: 'go.e' });
    expect(registry.resolve(key('x'), { pending: true, active: ALL })).toEqual({ kind: 'none' });
  });

  it('has no leader when the keymap has no sequence, and takes another leader key', () => {
    const plain = createShortcuts<Scope>([{ id: 'g.single', scope: 'global', keys: ['g'], label: 'g alone' }]);
    expect(plain.resolve(key('g'), { pending: false, active: new Set(['g.single']) })).toEqual({ kind: 'run', id: 'g.single' });
    const other = createShortcuts<Scope>([{ id: 'go.x', scope: 'global', keys: ['.', 'x'], label: 'go' }], { leader: '.' });
    expect(other.resolve(key('.'), { pending: false, active: new Set() })).toEqual({ kind: 'pending' });
    expect(other.resolve(key('x'), { pending: true, active: new Set(['go.x']) })).toEqual({ kind: 'run', id: 'go.x' });
  });

  it('does nothing while typing, but a checkbox keeps the keys', () => {
    const input = track(document.createElement('input'));
    expect(registry.resolve(key('e', { target: input }), idle)).toEqual({ kind: 'none' });
    const box = track(document.createElement('input'));
    box.type = 'checkbox';
    expect(registry.resolve(key('e', { target: box }), idle)).toEqual({ kind: 'run', id: 'mail.archive' });
  });

  it.each(['dialog', 'menu', 'grid', 'listbox', 'slider'])('does nothing inside a %s', (role) => {
    const el = track(document.createElement('div'));
    el.setAttribute('role', role);
    const inner = el.appendChild(document.createElement('button'));
    expect(registry.resolve(key('ArrowLeft', { target: inner }), idle)).toEqual({ kind: 'none' });
  });

  it('does nothing on a data-key block, with Alt, when prevented, or for Shift+arrows', () => {
    const block = track(document.createElement('div'));
    block.setAttribute('data-key', 'x');
    expect(registry.resolve(key('e', { target: block }), idle).kind).toBe('none');
    expect(registry.resolve(key('e', { altKey: true }), idle).kind).toBe('none');
    expect(registry.resolve(key('e', { defaultPrevented: true }), idle).kind).toBe('none');
    expect(registry.resolve(key('ArrowLeft', { shiftKey: true }), idle).kind).toBe('none');
    expect(registry.resolve(key('ArrowLeft'), idle).kind).toBe('run');
  });

  it('fires a mod chord with Ctrl or Cmd, and no other key with a modifier', () => {
    expect(registry.resolve(key('a', { ctrlKey: true }), idle)).toEqual({ kind: 'run', id: 'mail.selectAll' });
    expect(registry.resolve(key('a', { metaKey: true }), idle)).toEqual({ kind: 'run', id: 'mail.selectAll' });
    expect(registry.resolve(key('e', { ctrlKey: true }), idle).kind).toBe('none');
    expect(registry.resolve(key('a', { ctrlKey: true }), { pending: false, active: new Set() }).kind).toBe('none');
    const input = track(document.createElement('input'));
    expect(registry.resolve(key('a', { ctrlKey: true, target: input }), idle).kind).toBe('none');
  });

  it('lets an inFields chord fire from a plain field, but not from a dialog or an editor', () => {
    const input = track(document.createElement('input'));
    expect(registry.resolve(key('k', { ctrlKey: true, target: input }), idle)).toEqual({ kind: 'run', id: 'palette' });
    expect(registry.resolve(key('k', { ctrlKey: true, target: input }), { pending: false, active: new Set() })).toEqual({ kind: 'none' });
    const dialog = track(document.createElement('div'));
    dialog.setAttribute('role', 'dialog');
    expect(registry.resolve(key('k', { ctrlKey: true, target: dialog.appendChild(document.createElement('input')) }), idle)).toEqual({ kind: 'none' });
    const editor = track(document.createElement('div'));
    Object.defineProperty(editor, 'isContentEditable', { value: true });
    expect(registry.resolve(key('k', { ctrlKey: true, target: editor }), idle)).toEqual({ kind: 'none' });
    expect(registry.resolve(key('k'), idle)).toEqual({ kind: 'run', id: 'mail.prev' });
  });

  it('uses no key twice in a scope in the test keymap', () => {
    const seen = new Set<string>();
    for (const s of KEYMAP) {
      const k = `${s.scope}:${s.mod ? 'mod+' : ''}${s.keys.join(' ')}`;
      expect(seen.has(k)).toBe(false);
      seen.add(k);
    }
  });
});

describe('the registry', () => {
  it('runs the newest handler of an id, and the older one again after it is removed', () => {
    const r = createShortcuts(KEYMAP);
    const first = vi.fn();
    const second = vi.fn();
    const offFirst = r.register('help', first);
    const offSecond = r.register('help', second);
    r.run('help');
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    offSecond();
    r.run('help');
    expect(first).toHaveBeenCalledTimes(1);
    offFirst();
    expect(r.active().has('help')).toBe(false);
  });
});

describe('the hooks', () => {
  it('runs a registered handler and keeps g e from reaching the archive handler', () => {
    const r = createShortcuts(KEYMAP);
    const archive = vi.fn();
    const go = vi.fn();
    renderHook(() => {
      r.useListener();
      r.useShortcut('mail.archive', archive);
      r.useShortcut('go.e', go);
    });
    fireEvent.keyDown(window, { key: 'e' });
    expect(archive).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: 'g' });
    fireEvent.keyDown(window, { key: 'e' });
    expect(archive).toHaveBeenCalledTimes(1);
    expect(go).toHaveBeenCalledTimes(1);
  });

  it('lets the leader lapse after its window', () => {
    vi.useFakeTimers();
    const r = createShortcuts(KEYMAP, { leaderWindowMs: 500 });
    const go = vi.fn();
    const archive = vi.fn();
    renderHook(() => {
      r.useListener();
      r.useShortcut('go.e', go);
      r.useShortcut('mail.archive', archive);
    });
    fireEvent.keyDown(window, { key: 'g' });
    vi.advanceTimersByTime(600);
    fireEvent.keyDown(window, { key: 'e' });
    expect(go).not.toHaveBeenCalled();
    expect(archive).toHaveBeenCalledTimes(1);
  });

  it('does not listen when disabled, and a null handler leaves the key alone', () => {
    const r = createShortcuts(KEYMAP);
    const archive = vi.fn();
    const off = renderHook(() => {
      r.useListener({ enabled: false });
      r.useShortcut('mail.archive', archive);
    });
    fireEvent.keyDown(window, { key: 'e' });
    expect(archive).not.toHaveBeenCalled();
    off.unmount();
    renderHook(() => {
      r.useListener();
      r.useShortcut('mail.archive', null);
    });
    fireEvent.keyDown(window, { key: 'e' });
    expect(archive).not.toHaveBeenCalled();
  });

  it('prevents the default of a key it runs', () => {
    const r = createShortcuts(KEYMAP);
    renderHook(() => {
      r.useListener();
      r.useShortcut('help', () => undefined);
    });
    const event = new KeyboardEvent('keydown', { key: '?', cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe('ShortcutList and ShortcutSheet', () => {
  it('shows every keymap label, with `show` for keys that read badly and "then" between a sequence', () => {
    render(<ShortcutList rows={shortcutRows(KEYMAP)} />);
    for (const s of KEYMAP) expect(screen.getByText(s.label)).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getAllByText('then')).toHaveLength(2);
  });

  it('puts rows with a group under one heading each', () => {
    render(<ShortcutList rows={shortcutRows(KEYMAP)} />);
    expect(screen.getAllByRole('columnheader', { name: 'Mail' })).toHaveLength(1);
    expect(screen.getByRole('columnheader', { name: 'Everywhere' })).toBeInTheDocument();
  });

  it('opens as a modal with the list and its note, and closes', () => {
    const onClose = vi.fn();
    render(<ShortcutSheet rows={[{ keys: ['?'], label: 'This list' }, { keys: ['Ctrl+Enter'], label: 'Send' }]} onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('Shortcuts do nothing while you are typing in a field.')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    render(<ShortcutSheet rows={shortcutRows(KEYMAP)} onClose={() => undefined} />);
    expect(await axeViolations()).toEqual([]);
  });
});
