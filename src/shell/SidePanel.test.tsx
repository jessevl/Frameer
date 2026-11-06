/**
 * @file SidePanel.test.tsx
 * @description SidePanel, PanelContent and the stage store: the portalled content, the heading with Back and close, widening for a form, the empty line, `enabled`, `children`, the sliding and floating forms (Escape and outside press), the phone sheets, the panel stack's pure parts and its router hook, and axe.
 */
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { renderInRouter } from '../test/router';
import { PanelContent, StageCrumb } from './StageParts';
import { SidePanel } from './SidePanel';
import { PANEL_PARAM, panelSearch, parsePanelStack, poppedSearch, pushedSearch } from './panelStack';
import { useStageStore } from './stageStore';
import { usePanelStack } from './usePanelStack';

function phone(on: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: on && query.includes('max-width: 767'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(), onchange: null }));
}

afterEach(() => {
  phone(false);
  act(() => {
    const s = useStageStore.getState();
    s.setPanelTitle(null);
    s.setPanelWide(false);
    s.setCrumb(null);
  });
});

describe('SidePanel on desktop', () => {
  it('portals the page\'s content into the body and shows the heading in the bar half', () => {
    const onClose = vi.fn();
    const onBack = vi.fn();
    render(
      <>
        <SidePanel open onClose={vi.fn()} />
        <PanelContent title="Swap" onClose={onClose} onBack={onBack}>
          <p>form</p>
        </PanelContent>
      </>,
    );
    expect(screen.getByRole('region', { name: 'Details' })).toContainElement(screen.getByText('form'));
    expect(useStageStore.getState().panelTitle).toBe('Swap');
    act(() => useStageStore.getState().panelBack?.());
    act(() => useStageStore.getState().panelClose?.());
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clears the heading, Back and close when the page goes', () => {
    const { rerender } = render(
      <>
        <SidePanel open onClose={vi.fn()} />
        <PanelContent title="Swap" onClose={vi.fn()} onBack={vi.fn()} wide>
          <p>form</p>
        </PanelContent>
      </>,
    );
    expect(useStageStore.getState().panelWide).toBe(true);
    rerender(<SidePanel open onClose={vi.fn()} />);
    const s = useStageStore.getState();
    expect([s.panelTitle, s.panelBack, s.panelClose, s.panelWide]).toEqual([null, null, null, false]);
  });

  it('is 340 px, 480 px while a form is open, and says what it is for until a page fills it', () => {
    render(
      <>
        <SidePanel open onClose={vi.fn()} empty="Open an event." />
        <PanelContent title="Event" wide>
          <p>x</p>
        </PanelContent>
      </>,
    );
    expect(screen.getByTestId('side-panel')).toHaveStyle({ width: '480px' });
    expect(screen.queryByText('Open an event.')).toBeNull();
  });

  it('shows the empty line and the narrow width without a page', () => {
    render(<SidePanel open onClose={vi.fn()} empty="Open an event." />);
    expect(screen.getByText('Open an event.')).toBeInTheDocument();
    expect(screen.getByTestId('side-panel')).toHaveStyle({ width: '340px' });
  });

  it('is never drawn when closed or disabled, and draws children in the body', () => {
    const { rerender } = render(<SidePanel open={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('side-panel')).toBeNull();
    rerender(<SidePanel open onClose={vi.fn()} enabled={false} />);
    expect(screen.queryByTestId('side-panel')).toBeNull();
    rerender(
      <SidePanel open onClose={vi.fn()} empty="never">
        <p>route panel</p>
      </SidePanel>,
    );
    expect(screen.getByText('route panel')).toBeInTheDocument();
    expect(screen.queryByText('never')).toBeNull();
  });

  it('slides: it stays in the tree while shown', () => {
    render(<SidePanel open slide onClose={vi.fn()} paper={false} />);
    expect(screen.getByTestId('side-panel')).toBeInTheDocument();
    expect(screen.getByTestId('side-panel').className).not.toContain('paper-surface');
  });

  it('floats as a dialog that closes on Escape and on a press outside, but not on an ignored one', () => {
    const onClose = vi.fn();
    render(
      <>
        <button type="button" data-testid="toggle">t</button>
        <button type="button" data-testid="elsewhere">e</button>
        <SidePanel open floating ignore='[data-testid="toggle"]' onClose={onClose} />
      </>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByTestId('toggle'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByTestId('elsewhere'));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('passes axe with a page in it', async () => {
    render(
      <>
        <SidePanel open onClose={vi.fn()} />
        <PanelContent title="Event" onClose={vi.fn()}>
          <p>x</p>
        </PanelContent>
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});

describe('SidePanel on a phone', () => {
  it('is a full-screen sheet that opens only while a page has filled it', () => {
    phone(true);
    const { rerender } = render(<SidePanel open onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(
      <>
        <SidePanel open onClose={vi.fn()} />
        <PanelContent title="Event">
          <p>x</p>
        </PanelContent>
      </>,
    );
    expect(screen.getByRole('heading', { name: 'Event' })).toBeInTheDocument();
  });

  it('can be a bottom sheet that opens without content, with the app\'s own heading', () => {
    phone(true);
    render(<SidePanel open phone="sheet" requireContent={false} heading={<h2>Info</h2>} onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Info' })).toBeInTheDocument();
  });
});

describe('StageCrumb', () => {
  it('sets the last crumb while mounted and clears it after', () => {
    const { unmount } = render(<StageCrumb label="Anna" />);
    expect(useStageStore.getState().crumb).toBe('Anna');
    unmount();
    expect(useStageStore.getState().crumb).toBeNull();
  });
});

describe('the panel stack', () => {
  it('parses, pushes and pops ids in a query string and keeps the other parameters', () => {
    expect(parsePanelStack('a,b-1,Bad,,x y')).toEqual(['a', 'b-1']);
    expect(parsePanelStack(undefined)).toEqual([]);
    expect(pushedSearch('day=2026-11-12', 'swap')).toBe('day=2026-11-12&edit=swap');
    expect(pushedSearch('edit=a', 'b')).toBe('edit=a%2Cb');
    expect(pushedSearch('edit=a', 'Bad id')).toBe('edit=a');
    expect(poppedSearch('day=1&edit=a%2Cb')).toBe('day=1&edit=a');
    expect(poppedSearch('edit=a')).toBe('');
    expect(pushedSearch('', 'a', 'sub')).toBe('sub=a');
    expect(PANEL_PARAM).toBe('edit');
  });

  it('keeps only valid ids in a route search', () => {
    expect(panelSearch({ edit: 'a,Bad' })).toEqual({ edit: 'a' });
    expect(panelSearch({ edit: 'Bad' })).toEqual({});
    expect(panelSearch({ sub: 'a' }, 'sub')).toEqual({ sub: 'a' });
  });

  it('is held in the address: push adds a history entry, pop goes back one view', async () => {
    let seen: { stack: readonly string[]; push: (id: string) => void; pop: () => void } | null = null;
    function Probe() {
      const panel = usePanelStack();
      seen = panel;
      const [n, setN] = useState(0);
      return <button type="button" onClick={() => setN(n + 1)}>{panel.stack.join('>') || 'root'}</button>;
    }
    const { router } = await renderInRouter(<Probe />, '/care?day=2026-11-12');
    expect(screen.getByRole('button').textContent).toBe('root');
    await act(async () => seen?.push('swap'));
    expect(screen.getByRole('button').textContent).toBe('swap');
    expect(router.state.location.searchStr).toContain('edit=swap');
    expect(router.state.location.searchStr).toContain('day=2026-11-12');
    await act(async () => seen?.push('who'));
    expect(screen.getByRole('button').textContent).toBe('swap>who');
    await act(async () => seen?.pop());
    expect(screen.getByRole('button').textContent).toBe('swap');
  });
});
