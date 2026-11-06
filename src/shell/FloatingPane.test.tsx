/**
 * @file FloatingPane.test.tsx
 * @description usePane and FloatingPane: the docked or floating decision (`paneMode`), the toggle for a collapsed, a forced and a missing pane, the hover timers, docking again, and the floating card's slide, Escape, outside press, followed link and options, with axe.
 */
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { FloatingPane } from './FloatingPane';
import { HOVER_CLOSE_MS, HOVER_OPEN_MS, paneMode, usePane, type PaneControls, type PaneState } from './usePane';

function compact(on: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: on && query.includes('min-width: 768px'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(), onchange: null }));
}

function controls(over: Partial<PaneControls> = {}): PaneControls {
  return { collapsed: false, open: false, setOpen: vi.fn(), toggleCollapsed: vi.fn(), toggleOpen: vi.fn(), openOnHover: vi.fn(), closeOnLeave: vi.fn(), ...over };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  compact(false);
});

describe('paneMode', () => {
  it('docks on a wide window unless collapsed, and floats when compact, collapsed or forced', () => {
    expect(paneMode({ compact: false, collapsed: false })).toMatchObject({ docked: true, floating: false, forced: false });
    expect(paneMode({ compact: false, collapsed: true })).toMatchObject({ docked: false, floating: true, forced: false });
    expect(paneMode({ compact: true, collapsed: false })).toMatchObject({ docked: false, floating: true, forced: true });
    expect(paneMode({ compact: false, collapsed: false, forceFloating: true })).toMatchObject({ floating: true, forced: true });
  });

  it('has neither when the screen has no pane', () => {
    expect(paneMode({ compact: false, collapsed: false, none: true })).toMatchObject({ docked: false, floating: false, none: true });
  });
});

describe('usePane', () => {
  it('collapses the docked pane on the shortcut, and closes any float first', () => {
    const c = controls();
    const { result } = renderHook(() => usePane(c));
    expect(result.current.docked).toBe(true);
    act(() => result.current.toggle());
    expect(c.setOpen).toHaveBeenCalledWith(false);
    expect(c.toggleCollapsed).toHaveBeenCalledTimes(1);
    expect(c.toggleOpen).not.toHaveBeenCalled();
  });

  it('opens the float on the shortcut when the window or the app forces it', () => {
    compact(true);
    const c = controls({ open: true });
    const { result } = renderHook(() => usePane(c));
    expect(result.current).toMatchObject({ floating: true, forced: true, open: true });
    act(() => result.current.toggle());
    expect(c.toggleOpen).toHaveBeenCalledTimes(1);
    expect(c.toggleCollapsed).not.toHaveBeenCalled();
  });

  it('does nothing on the shortcut when there is no pane', () => {
    const c = controls();
    const { result } = renderHook(() => usePane(c, { none: true }));
    act(() => result.current.toggle());
    expect(c.toggleOpen).not.toHaveBeenCalled();
    expect(c.toggleCollapsed).not.toHaveBeenCalled();
  });

  it('opens after the pointer rests on the rail and closes after it leaves, never for touch', () => {
    const c = controls({ collapsed: true });
    const { result } = renderHook(() => usePane(c));
    act(() => result.current.hover.onPointerEnter({ pointerType: 'touch' }));
    act(() => void vi.advanceTimersByTime(HOVER_OPEN_MS));
    expect(c.openOnHover).not.toHaveBeenCalled();
    act(() => result.current.hover.onPointerEnter({ pointerType: 'mouse' }));
    act(() => void vi.advanceTimersByTime(HOVER_OPEN_MS));
    expect(c.openOnHover).toHaveBeenCalledTimes(1);
    act(() => result.current.hover.onPointerLeave({ pointerType: 'mouse' }));
    act(() => void vi.advanceTimersByTime(HOVER_CLOSE_MS));
    expect(c.closeOnLeave).toHaveBeenCalledTimes(1);
  });

  it('does not open on hover while the pane is docked', () => {
    const c = controls();
    const { result } = renderHook(() => usePane(c));
    act(() => result.current.hover.onPointerEnter({ pointerType: 'mouse' }));
    act(() => void vi.advanceTimersByTime(HOVER_OPEN_MS));
    expect(c.openOnHover).not.toHaveBeenCalled();
  });

  it('leaves nothing floating behind once it docks', () => {
    const c = controls();
    renderHook(() => usePane(c));
    expect(c.setOpen).toHaveBeenCalledWith(false);
  });
});

function pane(over: Partial<PaneState> = {}): PaneState {
  return { docked: false, floating: true, open: true, forced: false, none: false, toggle: vi.fn(), close: vi.fn(), hover: { onPointerEnter: vi.fn(), onPointerLeave: vi.fn() }, ...over };
}

describe('FloatingPane', () => {
  it('is not drawn when the pane is docked or closed', () => {
    const { rerender } = render(<FloatingPane pane={pane({ floating: false, open: false })}>x</FloatingPane>);
    expect(screen.queryByTestId('compact-pane')).toBeNull();
    rerender(<FloatingPane pane={pane({ open: false })}>x</FloatingPane>);
    expect(screen.queryByTestId('compact-pane')).toBeNull();
  });

  it('slides in, stays through the slide-out, then goes', () => {
    function Host() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(false)}>shut</button>
          <FloatingPane pane={pane({ open })}>
            <a href="/mail">Mail</a>
          </FloatingPane>
        </>
      );
    }
    render(<Host />);
    act(() => void vi.advanceTimersByTime(20));
    expect(screen.getByTestId('compact-pane')).toHaveAttribute('data-shown', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'shut' }));
    expect(screen.getByTestId('compact-pane')).toHaveAttribute('data-shown', 'false');
    act(() => void vi.advanceTimersByTime(400));
    expect(screen.queryByTestId('compact-pane')).toBeNull();
  });

  it('closes on Escape and on a press outside, but not on the rail or inside', () => {
    const p = pane();
    render(
      <>
        <div data-testid="rail">rail</div>
        <button type="button">elsewhere</button>
        <FloatingPane pane={p}>
          <a href="/mail">Mail</a>
        </FloatingPane>
      </>,
    );
    fireEvent.pointerDown(screen.getByTestId('rail'));
    fireEvent.pointerDown(screen.getByRole('link', { name: 'Mail', hidden: true }));
    expect(p.close).not.toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'elsewhere' }));
    expect(p.close).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(p.close).toHaveBeenCalledTimes(2);
  });

  it('closes when a link in it is followed, unless followSelector is empty', () => {
    const p = pane();
    const { rerender } = render(
      <FloatingPane pane={p}>
        <a href="/mail">Mail</a>
      </FloatingPane>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Mail', hidden: true }));
    expect(p.close).toHaveBeenCalledTimes(1);
    rerender(
      <FloatingPane pane={p} followSelector="">
        <a href="/mail">Mail</a>
      </FloatingPane>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Mail', hidden: true }));
    expect(p.close).toHaveBeenCalledTimes(1);
  });

  it('honours testId, ignore and stopEscape', () => {
    const p = pane();
    const onWindowKey = vi.fn();
    window.addEventListener('keydown', onWindowKey);
    render(
      <>
        <div data-menu-panel>menu</div>
        <FloatingPane pane={p} testId="floating-pane" ignore="[data-menu-panel]" stopEscape>
          x
        </FloatingPane>
      </>,
    );
    expect(screen.getByTestId('floating-pane')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByText('menu'));
    expect(p.close).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    window.removeEventListener('keydown', onWindowKey);
    expect(p.close).toHaveBeenCalledTimes(1);
  });

  it('passes axe once it has slid in (the card is inert while it is away)', async () => {
    vi.useRealTimers();
    render(
      <FloatingPane pane={pane()}>
        <nav aria-label="Pane">
          <a href="/mail">Mail</a>
        </nav>
      </FloatingPane>,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(await axeViolations()).toEqual([]);
  });
});
