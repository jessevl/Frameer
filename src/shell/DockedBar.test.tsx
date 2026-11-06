/**
 * @file DockedBar.test.tsx
 * @description DockedBar, PillHeader, BarTools and the stage tools: the slots, the panel's half (static and sliding), the breadcrumb's current crumb and its hooks (`renderCrumb`, `renderSeparator`, `titleId`), the registered tools (icon button, section switch, pill, add button with split, slider, node), the panel toggle, the phone view switch, and axe.
 */
import { useMemo, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { renderInRouter } from '../test/router';
import { BarTools, PanelToggle, groupTools } from './BarTools';
import { DockedBar } from './DockedBar';
import { PhoneViewSwitch } from './PhoneViewSwitch';
import { PillHeader, type Crumb } from './PillHeader';
import { StageToolsProvider, useStageTools, type StageTool } from './stageTools';
import { useStageStore } from './stageStore';

const CRUMBS: Crumb[] = [
  { label: 'Calendar', href: '/calendar' },
  { label: 'Week 45', icon: <i data-testid="glyph" />, count: '12' },
];

function Tools({ tools }: { tools: StageTool[] }) {
  const stable = useMemo(() => tools, [tools]);
  useStageTools(stable);
  return null;
}

describe('PillHeader', () => {
  it('links the earlier crumbs and names the stage with the last one', async () => {
    await renderInRouter(<PillHeader crumbs={CRUMBS} bar />);
    expect(screen.getByRole('link', { name: 'Calendar' })).toHaveAttribute('href', '/calendar');
    const current = screen.getByText('Week 45');
    expect(current.closest('[aria-current="page"]')).toHaveAttribute('id', 'stage-title');
    expect(screen.getByTestId('glyph')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    expect(await axeViolations()).toEqual([]);
  });

  it('draws a back button on the phone pill, and honours onBack, titleId and trailing', async () => {
    const onBack = vi.fn();
    await renderInRouter(<PillHeader crumbs={CRUMBS} stretch onBack={onBack} titleId={false} trailing={<b>people</b>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(document.getElementById('stage-title')).toBeNull();
    expect(screen.getByText('people')).toBeInTheDocument();
  });

  it('lets the app draw a crumb and its separator', async () => {
    await renderInRouter(
      <PillHeader
        crumbs={CRUMBS}
        bar
        renderCrumb={(crumb, { content, current }) => <span data-testid={`c-${crumb.label}`} data-current={current}>{content}</span>}
        renderSeparator={() => <button type="button" aria-label="Siblings" />}
      />,
    );
    expect(screen.getByTestId('c-Week 45')).toHaveAttribute('data-current', 'true');
    expect(screen.getAllByRole('button', { name: 'Siblings' })).toHaveLength(1);
  });

  it('takes the current crumb from the data when one says so', async () => {
    await renderInRouter(<PillHeader crumbs={[{ label: 'A', href: '/a', current: true }, { label: 'B', href: '/b' }]} bar />);
    expect(screen.getByText('A').closest('[aria-current="page"]')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'B' })).toBeInTheDocument();
  });
});

describe('DockedBar', () => {
  it('lays out crumbs, middle and trailing in the bar', async () => {
    await renderInRouter(<DockedBar crumbs={<span>crumbs</span>} middle={<span>middle</span>} trailing={<span>trailing</span>} />);
    expect(document.querySelector('[data-docked-bar]')).not.toBeNull();
    expect(screen.getByText('crumbs')).toBeInTheDocument();
    expect(screen.getByText('middle')).toBeInTheDocument();
    expect(screen.getByText('trailing')).toBeInTheDocument();
    expect(await axeViolations()).toEqual([]);
  });

  it('draws the panel half with the store heading and the toggle, only while the panel is open', async () => {
    act(() => useStageStore.getState().setPanelTitle('Event'));
    const toggle = <PanelToggle open onToggle={vi.fn()} />;
    await renderInRouter(<DockedBar crumbs="c" panel={{ open: true, toggle }} />);
    expect(screen.getByRole('heading', { name: 'Event' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide side panel' })).toHaveAttribute('aria-pressed', 'true');
    act(() => useStageStore.getState().setPanelTitle(null));
  });

  it('follows the panel width while a form is open', async () => {
    act(() => useStageStore.getState().setPanelWide(true));
    await renderInRouter(<DockedBar crumbs="c" panel={{ open: true, toggle: null, heading: <h2>Own</h2> }} />);
    expect(screen.getByRole('heading', { name: 'Own' }).parentElement).toHaveStyle({ width: '480px' });
    act(() => useStageStore.getState().setPanelWide(false));
  });

  it('leaves the panel half out while the panel is closed', async () => {
    await renderInRouter(<DockedBar crumbs="c" panel={{ open: false, toggle: <button type="button">t</button>, heading: <h2>Own</h2> }} />);
    expect(screen.queryByRole('heading', { name: 'Own' })).toBeNull();
  });

  it('slides the half: it is mounted while shown', async () => {
    await renderInRouter(<DockedBar crumbs="c" panel={{ open: true, slide: true, toggle: null, heading: <h2>Own</h2> }} />);
    expect(screen.getByRole('heading', { name: 'Own' })).toBeInTheDocument();
  });
});

describe('BarTools and the stage tools', () => {
  it('draws the registered tools, a section as one group, and the toggle after a divider', async () => {
    const onList = vi.fn();
    const tools: StageTool[] = [
      { id: 'filter', label: 'Filter', line: 'search', onClick: vi.fn(), active: true, dot: true },
      { id: 'day', label: 'Day', section: 'View', onClick: vi.fn() },
      { id: 'week', label: 'Week', section: 'View', onClick: onList, active: true },
    ];
    await renderInRouter(
      <StageToolsProvider>
        <Tools tools={tools} />
        <BarTools panelToggle={<PanelToggle open={false} onToggle={vi.fn()} />} />
      </StageToolsProvider>,
    );
    expect(screen.getByRole('toolbar', { name: 'Tools' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filter' })).toHaveAttribute('aria-pressed', 'true');
    const group = screen.getByRole('group', { name: 'View' });
    expect(group).toContainElement(screen.getByRole('button', { name: 'Week' }));
    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(onList).toHaveBeenCalledWith(expect.objectContaining({ x: expect.any(Number) }));
    expect(screen.getByRole('button', { name: 'Show side panel' })).toBeInTheDocument();
    expect(await axeViolations()).toEqual([]);
  });

  it('draws pills, the add button with its split, a slider and a node', async () => {
    const onAdd = vi.fn();
    const onSplit = vi.fn();
    const onSize = vi.fn();
    const tools: StageTool[] = [
      { id: 'sort', label: 'Sort', pill: true, value: 'Due', count: 2, onClick: vi.fn() },
      { id: 'new', label: 'New task', text: 'New', onClick: onAdd, split: { label: 'More to add', onClick: onSplit }, motion: 'new' },
      { id: 'size', label: 'Size', slider: { steps: 4, value: 1, onChange: onSize }, onClick: vi.fn() },
      { id: 'mine', label: 'Mine', node: <button type="button">Own control</button>, onClick: vi.fn() },
    ];
    await renderInRouter(
      <StageToolsProvider>
        <Tools tools={tools} />
        <BarTools divider={false} leading={<span>lead</span>} trailing={<span>trail</span>} />
      </StageToolsProvider>,
    );
    expect(screen.getByRole('button', { name: /^Sort/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'New task' }));
    fireEvent.click(screen.getByRole('button', { name: 'More to add' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onSplit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'New task' })).toHaveAttribute('data-motion', 'new');
    fireEvent.change(screen.getByRole('slider', { name: 'Size' }), { target: { value: '3' } });
    expect(onSize).toHaveBeenCalledWith(3);
    expect(screen.getByRole('button', { name: 'Own control' })).toBeInTheDocument();
    expect(await axeViolations()).toEqual([]);
  });

  it('groups only neighbours of the same section', () => {
    const tool = (id: string, section?: string): StageTool => ({ id, label: id, onClick: () => undefined, section });
    const entries = groupTools([tool('a', 'S'), tool('b', 'S'), tool('c'), tool('d', 'S')]);
    expect(entries.map((e) => (e.kind === 'section' ? e.tools.length : 1))).toEqual([2, 1, 1]);
  });

  it('removes a view\'s tools when it unmounts', async () => {
    const tools: StageTool[] = [{ id: 'x', label: 'Tool X', line: 'search', onClick: vi.fn() }];
    function View() {
      const [mounted, setMounted] = useState(true);
      return (
        <StageToolsProvider>
          <button type="button" onClick={() => setMounted(false)}>leave</button>
          {mounted ? <Tools tools={tools} /> : null}
          <BarTools />
        </StageToolsProvider>
      );
    }
    await renderInRouter(<View />);
    expect(screen.getByRole('button', { name: 'Tool X' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'leave' }));
    expect(screen.queryByRole('button', { name: 'Tool X' })).toBeNull();
  });
});

describe('PhoneViewSwitch', () => {
  it('shows only the tools marked phoneSwitch, as a labelled group with a pressed one', async () => {
    const tools: StageTool[] = [
      { id: 'list', label: 'List', section: 'Display', phoneSwitch: true, active: true, onClick: vi.fn() },
      { id: 'board', label: 'Board', section: 'Display', phoneSwitch: true, onClick: vi.fn() },
      { id: 'sort', label: 'Sort', onClick: vi.fn() },
    ];
    await renderInRouter(
      <StageToolsProvider>
        <Tools tools={tools} />
        <PhoneViewSwitch />
      </StageToolsProvider>,
    );
    expect(screen.getByRole('group', { name: 'Display' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Sort' })).toBeNull();
    expect(await axeViolations()).toEqual([]);
  });

  it('shows nothing without such tools', async () => {
    await renderInRouter(
      <StageToolsProvider>
        <PhoneViewSwitch />
      </StageToolsProvider>,
    );
    expect(screen.queryByRole('group')).toBeNull();
  });
});
