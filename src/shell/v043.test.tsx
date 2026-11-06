/**
 * @file v043.test.tsx
 * @description The v0.4.3 polish fixes: SidePanel overlaying the stage below a breakpoint (`overlayBelow`), DockedBar's crumbs and tools giving way, PropertyGrid's label column, a disabled Button's contrast, opaque toasts, 44 px touch hit areas (toast dismiss, Select, Checkbox) and the ink Spinner; with axe where a part renders. Colour contrast is computed from the tokens, since jsdom draws nothing.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { renderInRouter } from '../test/router';
import Button from '../components/ui/Button';
import Checkbox from '../components/ui/Checkbox';
import { PropertyGrid, PropertyRow } from '../components/ui/PropertyRow';
import Select from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { ToastContainer, toastInfo, useToastStore } from '../components/ui/Toast';
import { BarTools, PanelToggle } from './BarTools';
import { DockedBar } from './DockedBar';
import { SidePanel } from './SidePanel';
import { useStageStore } from './stageStore';

/** matchMedia where only the queries `on` accepts match. */
function media(on: (query: string) => boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: on(query), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(), onchange: null }));
}
const tablet = (q: string) => q.includes('max-width: 1023');

afterEach(() => {
  media(() => false);
  act(() => {
    useToastStore.getState().clearAll();
    useStageStore.getState().setPanelTitle(null);
  });
});

describe('SidePanel overlay below the breakpoint', () => {
  it('docks at desktop widths, as before', () => {
    media(() => false);
    render(<SidePanel open onClose={vi.fn()} />);
    expect(screen.getByTestId('side-panel')).not.toHaveAttribute('data-overlay');
    expect(screen.queryByTestId('side-panel-scrim')).toBeNull();
  });

  it('floats over the stage with a scrim at tablet widths, and closes on Escape and on the scrim', async () => {
    media(tablet);
    const onClose = vi.fn();
    render(<SidePanel open onClose={onClose} />);
    expect(screen.getByTestId('side-panel')).toHaveAttribute('data-overlay');
    expect(screen.getByRole('dialog', { name: 'Side panel' })).toBeInTheDocument();
    expect(screen.getByTestId('side-panel-scrim')).toBeInTheDocument();
    expect(await axeViolations()).toEqual([]);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.pointerDown(screen.getByTestId('side-panel-scrim'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('draws its own heading while overlaid, because the bar has no panel half then', () => {
    media(tablet);
    render(<SidePanel open onClose={vi.fn()} />);
    act(() => useStageStore.getState().setPanelTitle('Care this week'));
    expect(screen.getByRole('heading', { name: 'Care this week' })).toBeInTheDocument();
  });

  it('takes the breakpoint as a prop: 0 keeps it docked, a larger value overlays sooner', () => {
    media(tablet);
    const { rerender } = render(<SidePanel open onClose={vi.fn()} overlayBelow={0} />);
    expect(screen.getByTestId('side-panel')).not.toHaveAttribute('data-overlay');
    media((q) => q.includes('max-width: 1279'));
    rerender(<SidePanel open onClose={vi.fn()} overlayBelow={1280} />);
    expect(screen.getByTestId('side-panel')).toHaveAttribute('data-overlay');
  });

  it('keeps `floating` as the app drew it: a dialog without the scrim', () => {
    media(tablet);
    const onClose = vi.fn();
    render(<SidePanel open floating onClose={onClose} />);
    expect(screen.getByRole('dialog')).not.toHaveAttribute('data-overlay');
    expect(screen.queryByTestId('side-panel-scrim')).toBeNull();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('DockedBar gives way', () => {
  it('keeps the crumbs at 9 rem and clips them, and lets the tools shrink and scroll', async () => {
    media(() => false);
    await renderInRouter(<DockedBar crumbs={<span>Calendar</span>} trailing={<BarTools />} />);
    const crumbs = document.querySelector('[data-bar-crumbs]');
    expect(crumbs?.className).toContain('min-w-[9rem]');
    expect(crumbs?.className).toContain('overflow-hidden');
    const tools = screen.getByRole('toolbar', { name: 'Tools' });
    expect(tools.className).toContain('min-w-0');
    expect(tools.className).toContain('overflow-x-auto');
    expect(tools.className).not.toMatch(/(^| )flex-shrink-0/);
  });

  it('draws no panel half while the panel overlays the stage', async () => {
    const panel = { open: true, toggle: <PanelToggle open onToggle={vi.fn()} /> };
    media(() => false);
    const docked = await renderInRouter(<DockedBar crumbs={<span>x</span>} panel={panel} />);
    expect(screen.getByRole('button', { name: 'Hide side panel' })).toBeInTheDocument();
    docked.unmount();
    media(tablet);
    await renderInRouter(<DockedBar crumbs={<span>x</span>} panel={panel} />);
    expect(screen.queryByRole('button', { name: 'Hide side panel' })).toBeNull();
  });
});

describe('PropertyGrid label column', () => {
  it('fits the longest label up to a maximum instead of 88 px, and wraps rather than cuts', async () => {
    const { container, rerender } = render(
      <PropertyGrid>
        <PropertyRow label="Reminders">Day before</PropertyRow>
      </PropertyGrid>,
    );
    const grid = container.firstElementChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe('fit-content(10rem) 1fr 1fr');
    expect(screen.getByText('Reminders').className).not.toContain('truncate');
    expect(screen.getByText('Reminders').className).toContain('overflow-wrap:anywhere');
    rerender(
      <PropertyGrid labelMax="8rem">
        <PropertyRow label="Reminders">Day before</PropertyRow>
      </PropertyGrid>,
    );
    expect((container.firstElementChild as HTMLElement).style.gridTemplateColumns).toBe('fit-content(8rem) 1fr 1fr');
    expect(await axeViolations()).toEqual([]);
  });
});

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (c[0] ?? 0) + 0.7152 * (c[1] ?? 0) + 0.0722 * (c[2] ?? 0);
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}
/** A token's literal hex in the light (first) and dark (second) block of tokens.css. */
function token(name: string, theme: 'light' | 'dark'): string {
  const css = readFileSync(resolve(__dirname, '../styles/tokens.css'), 'utf8');
  const hits = [...css.matchAll(new RegExp(`^\\s*--${name}:\\s*(#[0-9A-Fa-f]{6})`, 'gm'))];
  const hit = hits[theme === 'light' ? 0 : 1];
  if (!hit?.[1]) throw new Error(`token ${name} ${theme}`);
  return hit[1];
}

describe('contrast and sizes', () => {
  it('draws a disabled primary button as grey ink on a quiet fill, not faded coral', async () => {
    render(<Button disabled>Sign in</Button>);
    const cls = screen.getByRole('button', { name: 'Sign in' }).className;
    expect(cls).toContain('disabled:bg-[var(--paper-3)]');
    expect(cls).toContain('disabled:text-[var(--ink-2)]');
    expect(cls).not.toContain('disabled:opacity');
    for (const theme of ['light', 'dark'] as const) expect(contrast(token('ink-2', theme), token('paper-3', theme))).toBeGreaterThanOrEqual(4.5);
    expect(await axeViolations()).toEqual([]);
  });

  it('puts a tinted toast on an opaque paper surface with ink words', async () => {
    render(<ToastContainer />);
    act(() => {
      toastInfo('Saved');
    });
    const toast = screen.getByTestId('toast');
    expect(toast.className).toContain('bg-[var(--paper)]');
    expect(screen.getByText('Saved').className).toContain('text-[var(--ink)]');
    for (const theme of ['light', 'dark'] as const) expect(contrast(token('ink', theme), token('paper', theme))).toBeGreaterThanOrEqual(4.5);
    expect(await axeViolations()).toEqual([]);
  });

  it('gives the toast dismiss button, Select and Checkbox a touch hit area', () => {
    render(
      <>
        <ToastContainer />
        <Select value="a" onChange={vi.fn()} options={[{ value: 'a', label: 'A' }]} size="sm" aria-label="Pick" />
        <Checkbox checked={false} onChange={vi.fn()} size="sm" />
      </>,
    );
    act(() => {
      toastInfo('Hello');
    });
    expect(screen.getByRole('button', { name: 'Dismiss' }).className).toContain('touch-target');
    expect(screen.getByRole('combobox', { name: 'Pick' }).className).toContain('touch-target');
    expect(screen.getByRole('checkbox').className).toContain('touch-target');
    const css = readFileSync(resolve(__dirname, '../styles/base.css'), 'utf8');
    expect(css).toMatch(/@media \(pointer: coarse\)\s*{\s*\.touch-target::after/);
    expect(css).toContain('max(100%, 44px)');
  });

  it('draws the Spinner in ink, never coral, and names it only when asked', async () => {
    const { container } = render(
      <>
        <Spinner label="Starting Harbour" />
        <Spinner />
      </>,
    );
    expect(screen.getByRole('status', { name: 'Starting Harbour' })).toBeInTheDocument();
    for (const svg of container.querySelectorAll('svg')) {
      expect(svg.getAttribute('class')).toContain('text-[var(--ink-2)]');
      expect(svg.getAttribute('class')).not.toContain('coral');
    }
    expect(await axeViolations()).toEqual([]);
  });
});
