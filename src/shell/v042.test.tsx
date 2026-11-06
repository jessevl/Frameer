/**
 * @file v042.test.tsx
 * @description The v0.4.2 API gaps: SidePanel (empty target, `ariaLabel`, test ids, `ownHeader`, `padded`, `scrollContainer`), DockedBar (`data-*`, `testId`, `stopAtPanel`), PhoneHeader (`subtitleLabel`, `subtitleTestId`, `scrollers`), PhoneTool (event and ref), Crumb labels as nodes, the exported stage tools registry, PictureBox `as`, and ShortcutList combinations; with axe where a part renders.
 */
import { createRef, useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { renderInRouter } from '../test/router';
import { PictureBox } from '../clay/PictureBox';
import { ShortcutList } from '../components/ui/ShortcutSheet';
import { DockedBar } from './DockedBar';
import { PhoneHeader, PhoneTool } from './PhoneHeader';
import { PillHeader } from './PillHeader';
import { SidePanel } from './SidePanel';
import { StageToolsContext, StageToolsProvider, useRegisteredStageTools, useStageToolsRegistry } from './stageTools';
import { useStageStore } from './stageStore';

afterEach(() => {
  act(() => useStageStore.getState().setPanelTitle(null));
});

describe('SidePanel v0.4.2', () => {
  it('gives the empty portal target no full height, so children start at the top', () => {
    render(
      <SidePanel open onClose={vi.fn()}>
        <p>mine</p>
      </SidePanel>,
    );
    const target = screen.getByText('mine').previousElementSibling;
    expect(target?.className).not.toContain('min-h-full');
  });

  it('fills the height once a page fills the panel', () => {
    render(<SidePanel open onClose={vi.fn()} />);
    act(() => useStageStore.getState().setPanelTitle('Swap'));
    expect(document.querySelector('#side-panel-body > div')?.className).toContain('min-h-full');
  });

  it('names the panel, keeps "Side panel" by default, and sets the test ids', async () => {
    const { rerender } = render(<SidePanel open onClose={vi.fn()} />);
    expect(screen.getByRole('complementary', { name: 'Side panel' })).toHaveAttribute('data-testid', 'side-panel');
    rerender(<SidePanel open onClose={vi.fn()} ariaLabel="Swap details" testId="panel" />);
    expect(screen.getByRole('complementary', { name: 'Swap details' })).toHaveAttribute('data-testid', 'panel');
    expect(await axeViolations()).toEqual([]);
  });

  it('uses the leaving test id while it slides shut', () => {
    const { rerender } = render(<SidePanel open slide onClose={vi.fn()} testId="panel" leavingTestId="panel-leaving" />);
    expect(screen.getByTestId('panel')).toBeInTheDocument();
    rerender(<SidePanel open={false} slide onClose={vi.fn()} testId="panel" leavingTestId="panel-leaving" />);
    expect(screen.getByTestId('panel-leaving')).toBeInTheDocument();
    expect(screen.queryByTestId('panel')).toBeNull();
  });

  it('draws the body with the inset by default, and without it for ownHeader, padded=false and scrollContainer=false', () => {
    const { rerender } = render(<SidePanel open onClose={vi.fn()} empty="Nothing" />);
    const body = () => document.getElementById('side-panel-body') as HTMLElement;
    expect(body().className).toContain('pt-[var(--stage-top)]');
    expect(body()).toHaveAttribute('data-stage-scroll');
    rerender(<SidePanel open onClose={vi.fn()} ownHeader />);
    expect(body().className).not.toContain('pt-[var(--stage-top)]');
    expect(body()).toHaveAttribute('data-stage-scroll');
    rerender(<SidePanel open onClose={vi.fn()} padded={false} scrollContainer={false} empty="Nothing" />);
    expect(body().className).not.toContain('pt-[var(--stage-top)]');
    expect(body()).not.toHaveAttribute('data-stage-scroll');
    expect(screen.getByText('Nothing').className).not.toContain('px-5');
  });
});

describe('DockedBar v0.4.2', () => {
  it('passes data-* attributes and a test id to the bar', async () => {
    render(<DockedBar crumbs={<span>Crumbs</span>} testId="docked-bar" data-story="today" data-panel="open" />);
    const bar = screen.getByTestId('docked-bar');
    expect(bar).toHaveAttribute('data-story', 'today');
    expect(bar).toHaveAttribute('data-panel', 'open');
    expect(bar).toHaveAttribute('data-docked-bar');
  });

  it('stops at the panel\'s edge instead of spanning it', () => {
    const panel = { open: true, toggle: <button type="button">Hide</button>, heading: <h2>Heading</h2> };
    const { rerender } = render(<DockedBar crumbs={<span>Crumbs</span>} panel={panel} stopAtPanel testId="bar" />);
    expect(screen.getByTestId('bar').style.right).toBe('340px');
    expect(screen.queryByText('Heading')).toBeNull();
    rerender(<DockedBar crumbs={<span>Crumbs</span>} panel={{ ...panel, open: false }} stopAtPanel testId="bar" />);
    expect(screen.getByTestId('bar').style.right).toBe('0px');
    rerender(<DockedBar crumbs={<span>Crumbs</span>} panel={panel} testId="bar" />);
    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByTestId('bar').style.right).toBe('');
  });
});

describe('PhoneHeader v0.4.2', () => {
  it('names the subtitle by the app\'s label and test id', async () => {
    const { rerender } = render(
      <main>
        <PhoneHeader title="Calendar" subtitle="3 left" onSubtitle={vi.fn()} subtitleLabel="Today" subtitleTestId="sub" />
      </main>,
    );
    expect(screen.getByRole('button', { name: 'Today: 3 left' })).toBe(screen.getByTestId('sub'));
    rerender(
      <main>
        <PhoneHeader title="Calendar" subtitle="3 left" subtitleTestId="sub" />
      </main>,
    );
    expect(screen.getByTestId('sub')).toHaveTextContent('3 left');
    expect(await axeViolations()).toEqual([]);
  });

  it('only lets the scrollers the app names collapse the title', () => {
    const { container } = render(
      <main>
        <PhoneHeader title="Calendar" scrollers="[data-phone-scroll]" />
        <div data-phone-scroll data-testid="vertical" />
        <div data-testid="strip" />
      </main>,
    );
    const stage = container.querySelector('main') as HTMLElement;
    const vertical = screen.getByTestId('vertical');
    vertical.scrollTop = 28;
    fireEvent.scroll(vertical);
    expect(stage.style.getPropertyValue('--title-p')).toBe('0.5');
    const strip = screen.getByTestId('strip');
    strip.scrollTop = 0;
    fireEvent.scroll(strip);
    expect(stage.style.getPropertyValue('--title-p')).toBe('0.5');
  });

  it('takes a predicate for the scrollers too', () => {
    const { container } = render(
      <main>
        <PhoneHeader title="Calendar" scrollers={(element) => element.dataset.testid === 'ok'} />
        <div data-testid="ok" />
        <div data-testid="no" />
      </main>,
    );
    const stage = container.querySelector('main') as HTMLElement;
    const no = screen.getByTestId('no');
    no.scrollTop = 56;
    fireEvent.scroll(no);
    expect(stage.style.getPropertyValue('--title-p')).toBe('0');
    const ok = screen.getByTestId('ok');
    ok.scrollTop = 56;
    fireEvent.scroll(ok);
    expect(stage.style.getPropertyValue('--title-p')).toBe('1');
  });
});

describe('PhoneTool v0.4.2', () => {
  it('passes the click event and forwards a ref', () => {
    const ref = createRef<HTMLElement>();
    let seen: EventTarget | null = null;
    const onClick = vi.fn((event: { currentTarget: EventTarget }) => {
      seen = event.currentTarget;
    });
    render(
      <PhoneTool ref={ref} label="More" onClick={onClick}>
        i
      </PhoneTool>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(seen).toBe(ref.current);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards the ref to a link', async () => {
    const ref = createRef<HTMLElement>();
    await renderInRouter(
      <PhoneTool ref={ref} label="Settings" href="/settings">
        i
      </PhoneTool>,
    );
    expect(ref.current?.tagName).toBe('A');
  });
});

describe('Crumb label v0.4.2', () => {
  it('draws a node as the label', async () => {
    await renderInRouter(
      <PillHeader
        bar
        crumbs={[
          { label: 'Calendar', href: '/calendar' },
          { label: <em data-testid="rich">Week 45</em>, key: 'week' },
          { label: <strong>Day</strong> },
        ]}
      />,
    );
    expect(screen.getByTestId('rich')).toHaveTextContent('Week 45');
    expect(screen.getByText('Day').closest('[aria-current="page"]')).not.toBeNull();
  });
});

describe('stage tools registry', () => {
  it('exports the context and a hook for the registry', () => {
    function Probe() {
      const { setTools } = useStageToolsRegistry();
      const tools = useRegisteredStageTools();
      useEffect(() => setTools([{ id: 'a', label: 'A', onClick: () => undefined }]), [setTools]);
      return <p data-testid="n">{tools.length}</p>;
    }
    render(
      <StageToolsProvider>
        <Probe />
      </StageToolsProvider>,
    );
    expect(screen.getByTestId('n')).toHaveTextContent('1');
  });

  it('can be provided without the provider', () => {
    function Probe() {
      return <p data-testid="n">{useRegisteredStageTools().length}</p>;
    }
    render(
      <StageToolsContext.Provider value={{ tools: [{ id: 'a', label: 'A', onClick: () => undefined }], setTools: () => undefined }}>
        <Probe />
      </StageToolsContext.Provider>,
    );
    expect(screen.getByTestId('n')).toHaveTextContent('1');
  });
});

describe('PictureBox as', () => {
  it('draws a span that can sit in a button', async () => {
    render(
      <button type="button">
        <PictureBox as="span" label="Scene" data-testid="box" />
      </button>,
    );
    expect(screen.getByTestId('box').tagName).toBe('SPAN');
    expect(await axeViolations()).toEqual([]);
  });

  it('keeps a div by default', () => {
    render(<PictureBox data-testid="box" />);
    expect(screen.getByTestId('box').tagName).toBe('DIV');
  });
});

describe('ShortcutList combinations', () => {
  it('draws a combination as keycaps joined by +, a sequence with "then", and a string as one keycap', async () => {
    render(
      <ShortcutList
        rows={[
          { keys: [['Ctrl', 'K']], label: 'Search' },
          { keys: ['g', 'e'], label: 'Go to events' },
          { keys: ['Ctrl+Shift+N'], label: 'New folder' },
          { keys: [['Ctrl', 'K'], 'x'], label: 'Mixed' },
        ]}
      />,
    );
    const rows = screen.getAllByRole('row').slice(1);
    const caps = (row: HTMLElement) => Array.from(row.querySelectorAll('kbd')).map((k) => k.textContent);
    expect(caps(rows[0] as HTMLElement)).toEqual(['Ctrl', 'K']);
    expect(rows[0]?.querySelector('[data-testid="shortcut-combo"]')).not.toBeNull();
    expect(rows[1]?.querySelectorAll('kbd')).toHaveLength(2);
    expect(rows[1]?.querySelector('td')).toHaveTextContent('then');
    expect(caps(rows[2] as HTMLElement)).toEqual(['Ctrl+Shift+N']);
    expect(caps(rows[3] as HTMLElement)).toEqual(['Ctrl', 'K', 'x']);
    expect(await axeViolations()).toEqual([]);
  });
});
