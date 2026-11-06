/**
 * @file shortcuts.ts
 * @description Keyboard shortcuts as data, generic over the app's scopes. The app writes its keymap (id, scope, keys, label) and calls `createShortcuts(keymap)`; what comes back is one registry: `resolve`, the pure rule that decides what a keystroke does; `register`, `active` and `run` for the handlers that features add; the hook `useShortcut` that a feature calls to handle a key; and the hook `useListener` that the shell calls once, the only `keydown` listener. The shortcut list and the sheet (`ShortcutList`, `ShortcutSheet`) read the same keymap, so they cannot drift from what fires. The keymap, and what each id does, stay in the app.
 *
 * A scope is active when a feature has registered a handler for its ids; there is no other switch, so a key does nothing on a page that does not handle it.
 *
 * Nothing fires: while typing (a `mod` chord marked `inFields` is the one exception, in a plain field); with Alt held, or with Ctrl or Cmd held unless the key is a `mod` chord; when the event is `defaultPrevented`; inside a dialog, menu, grid, listbox or slider; on an element with `data-key` (it owns its keys); for Shift+arrows. A pending leader key (`g`) takes the next key, so `g e` jumps and never runs the single `e`.
 *
 * @app SHARED - Generic: knows nothing about any app's keys.
 * Ported from harbour@src/lib/shortcuts.ts, src/shell/useShortcuts.ts and src/ui/useShortcut.ts.
 * Used by: ShortcutList, ShortcutSheet, and each app's shell (one `useListener`) and features (`useShortcut`).
 */
import { useEffect, useRef } from 'react';

export interface Shortcut<S extends string = string> {
  /** Stable name that features register a handler under, e.g. `mail.archive`. */
  id: string;
  /** Which part of the app the key belongs to; the app names its own scopes. Informational for the list: a key fires when its id has a handler. */
  scope: S;
  /** The keys to press, in order (`['g', 'm']`), as `KeyboardEvent.key` values. At most two: one key, or the leader and a key. */
  keys: readonly string[];
  /** What the shortcut list says. */
  label: string;
  /** How the keys are shown when `KeyboardEvent.key` reads badly (an arrow, a Shift chord). */
  show?: readonly string[];
  /** Pressed with Ctrl or Cmd (`keys[0]` is the lower-case key). The only keys that fire with a modifier. */
  mod?: boolean;
  /** A `mod` chord that also fires from a plain text field (not from a dialog, menu, grid or rich-text editor), such as Ctrl+K for a palette. */
  inFields?: boolean;
  /** A heading the list puts this row under (optional). */
  group?: string;
}

/** One step of a row: a key, or a combination held together. */
export type ShortcutKey = string | readonly string[];

/** What the list shows for one shortcut. */
export interface ShortcutRow {
  /** What to press. A string is one keycap; the keys of a row read in sequence ("g then e"). An array is a combination held together, drawn as keycaps joined by "+" (`['Ctrl', 'K']`). */
  keys: readonly ShortcutKey[];
  label: string;
  group?: string;
}

/** The part of a KeyboardEvent that `resolve` reads. */
export interface KeyInput {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  defaultPrevented: boolean;
  target: EventTarget | null;
}

export interface KeyState {
  /** True when the leader key was pressed a moment ago. */
  pending: boolean;
  /** Ids that have a handler right now. */
  active: ReadonlySet<string>;
}

export type Resolution = { kind: 'none' } | { kind: 'pending' } | { kind: 'run'; id: string };

export interface ShortcutOptions {
  /** The key that starts a two-key shortcut. Default `g`. */
  leader?: string;
  /** How long the leader waits for the second key, in milliseconds. Default 1500. */
  leaderWindowMs?: number;
  /** Selector of surfaces that own their keys. Default dialogs, menus, grids, listboxes and sliders. */
  ownKeys?: string;
  /** Selector of fields that take typed text. Default every input except a checkbox, textareas, selects and editable elements. */
  typing?: string;
}

export interface ShortcutRegistry<S extends string = string> {
  readonly keymap: readonly Shortcut<S>[];
  /** What one keystroke does. Pure: the caller keeps `pending` and runs the handler. */
  resolve(event: KeyInput, state: KeyState): Resolution;
  /** Adds a handler for a keymap id and returns the function that removes it. The newest handler of an id wins. */
  register(id: string, handler: () => void): () => void;
  /** The ids that have a handler. */
  active(): ReadonlySet<string>;
  /** Runs the newest handler of an id. */
  run(id: string): void;
  /** How a feature handles a key: pass `null` while it does not apply. The handler may change every render. */
  useShortcut(id: string, handler: (() => void) | null): void;
  /** The one `keydown` listener, called once by the shell. Keeps the pending leader, calls `preventDefault` and runs the handler. Pass `enabled: false` where there is no keyboard (a phone). */
  useListener(options?: { enabled?: boolean }): void;
}

/** `⌘` on Apple platforms, `Ctrl` elsewhere: how the app writes a modifier in `show`. */
export const MOD_KEY = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

const OWN_KEYS = '[role=dialog], [role=menu], [role=grid], [role=listbox], [role=slider]';
/** A checkbox does not take typed text: a row's checkbox keeps the focus after a click, and the keys still work. */
const TYPING = 'input:not([type=checkbox]), textarea, select, [contenteditable=""], [contenteditable="true"]';

/** The rows the list shows for a keymap: `show` where a key reads badly, else `keys`. */
export function shortcutRows(keymap: readonly Shortcut[]): ShortcutRow[] {
  return keymap.map((s) => ({ keys: s.show ?? s.keys, label: s.label, group: s.group }));
}

/** Builds the registry for an app's keymap. Call once at module level. */
export function createShortcuts<S extends string>(keymap: readonly Shortcut<S>[], options: ShortcutOptions = {}): ShortcutRegistry<S> {
  const leader = options.leader ?? 'g';
  const windowMs = options.leaderWindowMs ?? 1500;
  const ownKeys = options.ownKeys ?? OWN_KEYS;
  const typing = options.typing ?? TYPING;
  const handlers = new Map<string, Array<() => void>>();

  const blocked = (event: KeyInput): boolean => {
    if (event.altKey || event.defaultPrevented) return true;
    if (event.shiftKey && event.key.startsWith('Arrow')) return true;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return false;
    return target.isContentEditable || target.closest(typing) !== null || target.closest(ownKeys) !== null || target.closest('[data-key]') !== null;
  };

  /** A chord marked `inFields`: fires from a plain field too, but not from a dialog, menu or grid, or a rich-text editor (where it may mean a link). */
  const fieldChord = (event: KeyInput, state: KeyState): string | null => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.defaultPrevented) return null;
    const chord = keymap.find((s) => s.mod === true && s.inFields === true && s.keys[0] === event.key.toLowerCase() && state.active.has(s.id));
    if (!chord) return null;
    const target = event.target;
    return !(target instanceof HTMLElement) || (!target.isContentEditable && target.closest(ownKeys) === null) ? chord.id : null;
  };

  const resolve = (event: KeyInput, state: KeyState): Resolution => {
    const inField = fieldChord(event, state);
    if (inField) return { kind: 'run', id: inField };
    if (blocked(event)) return { kind: 'none' };
    if (event.ctrlKey || event.metaKey) {
      const chord = keymap.find((s) => s.mod === true && s.keys[0] === event.key.toLowerCase() && state.active.has(s.id));
      return chord ? { kind: 'run', id: chord.id } : { kind: 'none' };
    }
    if (state.pending) {
      const jump = keymap.find((s) => s.mod !== true && s.keys.length === 2 && s.keys[0] === leader && s.keys[1] === event.key && state.active.has(s.id));
      return jump ? { kind: 'run', id: jump.id } : { kind: 'none' };
    }
    if (event.key === leader && keymap.some((s) => s.mod !== true && s.keys.length === 2 && s.keys[0] === leader)) return { kind: 'pending' };
    const hit = keymap.find((s) => s.mod !== true && s.keys.length === 1 && s.keys[0] === event.key && state.active.has(s.id));
    return hit ? { kind: 'run', id: hit.id } : { kind: 'none' };
  };

  const register = (id: string, handler: () => void): (() => void) => {
    const stack = handlers.get(id) ?? [];
    stack.push(handler);
    handlers.set(id, stack);
    return () => {
      const rest = (handlers.get(id) ?? []).filter((h) => h !== handler);
      if (rest.length > 0) handlers.set(id, rest);
      else handlers.delete(id);
    };
  };

  const active = (): ReadonlySet<string> => new Set(handlers.keys());

  const run = (id: string): void => {
    const stack = handlers.get(id);
    stack?.[stack.length - 1]?.();
  };

  const useShortcut = (id: string, handler: (() => void) | null): void => {
    const ref = useRef(handler);
    useEffect(() => {
      ref.current = handler;
    });
    const on = handler !== null;
    useEffect(() => {
      if (!on) return;
      return register(id, () => ref.current?.());
    }, [id, on]);
  };

  const useListener = ({ enabled = true }: { enabled?: boolean } = {}): void => {
    useEffect(() => {
      if (!enabled) return;
      let pendingUntil = 0;
      const onKey = (event: KeyboardEvent) => {
        const result = resolve(event, { pending: pendingUntil > Date.now(), active: active() });
        pendingUntil = result.kind === 'pending' ? Date.now() + windowMs : 0;
        if (result.kind !== 'run') return;
        event.preventDefault();
        run(result.id);
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [enabled]);
  };

  return { keymap, resolve, register, active, run, useShortcut, useListener };
}
