/**
 * @file usePaneFromStore.test.tsx
 * @description usePaneFromStore builds the PaneControls from a zustand store and named keys, and the controls act on the store.
 */
import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { create } from 'zustand';
import { usePaneFromStore } from './usePane';

interface Shell {
  paneCollapsed: boolean;
  paneOpen: boolean;
  setPaneOpen: (open: boolean) => void;
  collapsePane: () => void;
  togglePaneOpen: () => void;
  hoverOpen: () => void;
  hoverClose: () => void;
}

const useShell = create<Shell>((set) => ({
  paneCollapsed: false,
  paneOpen: false,
  setPaneOpen: (open) => set({ paneOpen: open }),
  collapsePane: () => set((s) => ({ paneCollapsed: !s.paneCollapsed })),
  togglePaneOpen: () => set((s) => ({ paneOpen: !s.paneOpen })),
  hoverOpen: () => set({ paneOpen: true }),
  hoverClose: () => set({ paneOpen: false }),
}));

const KEYS = { collapsed: 'paneCollapsed', open: 'paneOpen', setOpen: 'setPaneOpen', toggleCollapsed: 'collapsePane', toggleOpen: 'togglePaneOpen', openOnHover: 'hoverOpen', closeOnLeave: 'hoverClose' } as const;

describe('usePaneFromStore', () => {
  it('reads the flags from the store and the toggle writes to it', () => {
    window.matchMedia = ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false, onchange: null })) as typeof window.matchMedia;
    const { result } = renderHook(() => usePaneFromStore(useShell, KEYS));
    expect(result.current.docked).toBe(true);
    act(() => result.current.toggle());
    expect(useShell.getState().paneCollapsed).toBe(true);
    expect(result.current.floating).toBe(true);
    act(() => result.current.toggle());
    expect(useShell.getState().paneCollapsed).toBe(false);
  });
});
