/**
 * @file usePane.ts
 * @description Whether the side pane is docked next to the stage or floats over it, and how it opens. Above 1100 px it docks unless the person collapsed it (⌘\); in compact windows (768 to 1100 px), when collapsed, and when the app forces it (`forceFloating`: Lighthouse floats the pane while a story is open) it floats over the stage, opening while the pointer rests on the rail or after ⌘\, and closing when the pointer leaves, on Escape, or when a link in it is followed. `none` is a screen with no pane at all (Lighthouse's Today): neither docked nor floating.
 * Why: a narrow desktop window must never squeeze the stage, and hover-open gives the pane back without a click.
 * The state lives in the app's store: the app hands this hook the flags and actions (`PaneControls`), and wraps the call in its own `usePane()` so Rail and FloatingPane read one source. The timers are shared by the whole shell, so the rail and the floating pane hand the pointer to each other.
 * Used by: the app's `usePane`, Rail and FloatingPane.
 */
import { useCallback, useEffect, useRef } from 'react';
import { useIsCompact } from './useShellMode';

/** The pointer must rest this long on the rail before the pane opens, and be away this long before it closes. */
export const HOVER_OPEN_MS = 150;
export const HOVER_CLOSE_MS = 280;

let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

function cancelTimers(): void {
  clearTimeout(openTimer);
  clearTimeout(closeTimer);
}

/** What the app's store gives the hook: two flags and the actions on them. */
export interface PaneControls {
  /** The person collapsed the docked pane. */
  collapsed: boolean;
  /** The floating pane is showing. */
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Collapses or restores the docked pane. */
  toggleCollapsed: () => void;
  /** Shows or hides the floating pane. */
  toggleOpen: () => void;
  /** The pointer rested on the rail: show the floating pane (the store may refuse, e.g. while a menu is open). */
  openOnHover: () => void;
  /** The pointer left: hide the floating pane. */
  closeOnLeave: () => void;
}

export interface PaneOptions {
  /** The app floats the pane for a reason of its own (an open story), whatever the width. */
  forceFloating?: boolean;
  /** This screen has no pane. */
  none?: boolean;
}

export interface PaneHover {
  onPointerEnter: (event: { pointerType: string }) => void;
  onPointerLeave: (event: { pointerType: string }) => void;
}

export interface PaneState {
  /** The pane sits in the sidebar card next to the rail. */
  docked: boolean;
  /** The pane floats over the stage (compact window, collapsed, or forced). */
  floating: boolean;
  /** The floating pane is showing. */
  open: boolean;
  /** The pane floats because of the window or the app, not because it was collapsed: ⌘\ then opens the float instead of collapsing. */
  forced: boolean;
  /** No pane on this screen. */
  none: boolean;
  /** ⌘\: collapses or restores the docked pane; opens or closes the floating one; does nothing when there is none. */
  toggle: () => void;
  close: () => void;
  /** Pointer handlers for the rail's section buttons and the floating pane itself. */
  hover: PaneHover;
}

/** The docked or floating decision as a pure function. */
export function paneMode({ compact, collapsed, forceFloating = false, none = false }: { compact: boolean; collapsed: boolean; forceFloating?: boolean; none?: boolean }): Pick<PaneState, 'docked' | 'floating' | 'forced' | 'none'> {
  if (none) return { docked: false, floating: false, forced: true, none: true };
  const forced = compact || forceFloating;
  const docked = !forced && !collapsed;
  return { docked, floating: !docked, forced, none: false };
}

/** The store keys that hold each of the `PaneControls`, for `usePaneFromStore`. */
export type PaneStoreKeys<S> = {
  [K in keyof PaneControls]: { [Key in keyof S]: S[Key] extends PaneControls[K] ? Key : never }[keyof S];
};

/** `usePane` over a zustand-like store: `usePaneFromStore(useShellStore, { collapsed: 'paneCollapsed', open: 'paneOpen', ... })` reads one key at a time (so a component only re-renders for the pane's own flags) and builds the `PaneControls`. */
export function usePaneFromStore<S>(useStore: <T>(selector: (state: S) => T) => T, keys: PaneStoreKeys<S>, options: PaneOptions = {}): PaneState {
  const controls: PaneControls = {
    collapsed: useStore((s) => s[keys.collapsed]) as boolean,
    open: useStore((s) => s[keys.open]) as boolean,
    setOpen: useStore((s) => s[keys.setOpen]) as PaneControls['setOpen'],
    toggleCollapsed: useStore((s) => s[keys.toggleCollapsed]) as PaneControls['toggleCollapsed'],
    toggleOpen: useStore((s) => s[keys.toggleOpen]) as PaneControls['toggleOpen'],
    openOnHover: useStore((s) => s[keys.openOnHover]) as PaneControls['openOnHover'],
    closeOnLeave: useStore((s) => s[keys.closeOnLeave]) as PaneControls['closeOnLeave'],
  };
  return usePane(controls, options);
}

export function usePane(controls: PaneControls, options: PaneOptions = {}): PaneState {
  const compact = useIsCompact();
  const { docked, floating, forced, none } = paneMode({ compact, collapsed: controls.collapsed, forceFloating: options.forceFloating, none: options.none });
  // The callbacks read the latest controls through this ref, so their identity holds still.
  const latest = useRef(controls);
  useEffect(() => {
    latest.current = controls;
  });

  const toggle = useCallback(() => {
    if (none) return;
    const c = latest.current;
    if (forced) c.toggleOpen();
    else {
      c.setOpen(false);
      c.toggleCollapsed();
    }
  }, [forced, none]);
  const close = useCallback(() => {
    cancelTimers();
    latest.current.setOpen(false);
  }, []);
  const onPointerEnter = useCallback(
    (event: { pointerType: string }) => {
      // Touch has no hover; a tap on the rail goes to the view.
      if (!floating || event.pointerType === 'touch') return;
      cancelTimers();
      openTimer = setTimeout(() => latest.current.openOnHover(), HOVER_OPEN_MS);
    },
    [floating],
  );
  const onPointerLeave = useCallback(
    (event: { pointerType: string }) => {
      if (!floating || event.pointerType === 'touch') return;
      cancelTimers();
      closeTimer = setTimeout(() => latest.current.closeOnLeave(), HOVER_CLOSE_MS);
    },
    [floating],
  );

  // Docking again (a wider window) leaves nothing floating behind.
  useEffect(() => {
    if (docked) {
      cancelTimers();
      latest.current.setOpen(false);
    }
  }, [docked]);

  return { docked, floating, open: floating && controls.open, forced, none, toggle, close, hover: { onPointerEnter, onPointerLeave } };
}
