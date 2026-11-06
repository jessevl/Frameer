/**
 * @file PhoneHeader.test.tsx
 * @description PhoneHeader, PhoneTool, PhoneTabBar and the large title's scroll: the header's slots and variants, the collapse written as `--title-p`, the tab bar's links, buttons, nodes, create button and tap on the current tab, the keyboard, and axe.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { renderInRouter } from '../test/router';
import { COLLAPSE_PX, collapseProgress } from './largeTitle';
import { PhoneHeader, PhoneTool } from './PhoneHeader';
import { PhoneTabBar, type PhoneTab } from './PhoneTabBar';

describe('collapseProgress', () => {
  it('runs from 0 to 1 over the collapse distance and stays inside that', () => {
    expect(collapseProgress(-10)).toBe(0);
    expect(collapseProgress(COLLAPSE_PX / 2)).toBe(0.5);
    expect(collapseProgress(COLLAPSE_PX * 3)).toBe(1);
  });
});

function Stage({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}

describe('PhoneHeader', () => {
  it('has the mark, the compact title, the tools pill and the large title as the page heading', () => {
    render(
      <Stage>
        <PhoneHeader title="Calendar" leading={<span data-testid="mark" />} tools={<PhoneTool label="Details" onClick={vi.fn()}>i</PhoneTool>} />
      </Stage>,
    );
    expect(screen.getByTestId('mark')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Calendar' })).toHaveAttribute('id', 'stage-title');
    expect(screen.getByRole('toolbar', { name: 'Tools' })).toContainElement(screen.getByRole('button', { name: 'Details' }));
  });

  it('draws a back button with the parent\'s name in place of the mark', () => {
    const onClick = vi.fn();
    render(<PhoneHeader title="Anna" leading={<span data-testid="mark" />} back={{ label: 'Back to People', name: 'People', onClick }} />);
    expect(screen.queryByTestId('mark')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Back to People' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('People')).toBeInTheDocument();
  });

  it('opens something from the subtitle when it is a button, and shows a quiet one otherwise', () => {
    const onSubtitle = vi.fn();
    const { rerender } = render(<PhoneHeader title="Today" subtitle="12 unread" onSubtitle={onSubtitle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Today: 12 unread' }));
    expect(onSubtitle).toHaveBeenCalledTimes(1);
    rerender(<PhoneHeader title="Today" subtitle="12 unread" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('12 unread')).toBeInTheDocument();
  });

  it('can leave out the large title, keep the compact pill (compact) or make the title decorative', () => {
    const { rerender } = render(<PhoneHeader title="Reader" largeTitle={false} />);
    expect(screen.queryByTestId('large-title')).toBeNull();
    rerender(<PhoneHeader title="Reader" compact />);
    expect(screen.queryByTestId('large-title')).toBeNull();
    expect(screen.getByText('Reader')).toHaveAttribute('data-compact', 'true');
    rerender(<PhoneHeader title="Files" decorative />);
    expect(screen.queryByRole('heading', { name: 'Files' })).toBeNull();
    expect(screen.getByTestId('large-title').querySelector('h2')).toHaveAttribute('aria-hidden', 'true');
    rerender(<PhoneHeader title="Files" center={<span>Segments</span>} />);
    expect(screen.getByText('Segments')).toBeInTheDocument();
  });

  it('writes the scroll to the stage as --title-p and marks it, and cleans up', () => {
    const { unmount } = render(
      <Stage>
        <PhoneHeader title="Calendar" />
        <div data-testid="list" />
      </Stage>,
    );
    const stage = document.querySelector('main') as HTMLElement;
    expect(stage).toHaveAttribute('data-large-title');
    expect(stage.style.getPropertyValue('--title-p')).toBe('0');
    const list = screen.getByTestId('list');
    Object.defineProperty(list, 'scrollTop', { value: COLLAPSE_PX / 2, configurable: true });
    act(() => void list.dispatchEvent(new Event('scroll')));
    expect(stage.style.getPropertyValue('--title-p')).toBe('0.5');
    unmount();
    expect(stage.style.getPropertyValue('--title-p')).toBe('');
    expect(stage).not.toHaveAttribute('data-large-title');
  });

  it('makes a tool a link with an href', async () => {
    await renderInRouter(<PhoneTool label="Settings" href="/settings">s</PhoneTool>);
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('passes axe', async () => {
    render(
      <Stage>
        <PhoneHeader title="Calendar" back={{ label: 'Back', onClick: vi.fn() }} subtitle="Week 45" tools={<PhoneTool label="More" onClick={vi.fn()}>m</PhoneTool>} />
      </Stage>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});

const TABS: PhoneTab[] = [
  { id: 'mail', label: 'Mail', line: 'list', href: '/mail' },
  { id: 'cal', label: 'Calendar', line: 'panel', href: '/calendar' },
  { id: 'care', label: 'Care', line: 'search', href: '/care' },
];

describe('PhoneTabBar', () => {
  it('draws labelled links, marks the current one and puts create in the middle', async () => {
    await renderInRouter(<PhoneTabBar tabs={TABS} activeId="cal" create={<button type="button">New</button>} />);
    const nav = screen.getByRole('navigation', { name: 'Sections' });
    expect(nav).toHaveAttribute('data-testid', 'phone-tabs');
    expect(screen.getByRole('link', { name: 'Calendar' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Mail' })).toHaveAttribute('href', '/mail');
    const labels = Array.from(nav.children).map((el) => el.textContent);
    expect(labels).toEqual(['Mail', 'New', 'Calendar', 'Care']);
    expect(await axeViolations()).toEqual([]);
  });

  it('puts create where createAt says, including the end', async () => {
    await renderInRouter(<PhoneTabBar tabs={TABS} activeId={null} createAt={3} create={<button type="button">New</button>} />);
    expect(Array.from(screen.getByRole('navigation').children).map((el) => el.textContent)).toEqual(['Mail', 'Calendar', 'Care', 'New']);
  });

  it('runs onNavigate on a press, and scrolls to the top instead of navigating on the current tab', async () => {
    const onNavigate = vi.fn();
    const onActiveTap = vi.fn();
    const { router } = await renderInRouter(<PhoneTabBar tabs={TABS} activeId="cal" onNavigate={onNavigate} onActiveTap={onActiveTap} />);
    fireEvent.click(screen.getByRole('link', { name: 'Calendar' }));
    expect(onActiveTap).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe('/');
    fireEvent.click(screen.getByRole('link', { name: 'Care' }));
    expect(onNavigate).toHaveBeenCalledTimes(2);
    expect(onActiveTap).toHaveBeenCalledTimes(1);
  });

  it('draws buttons for tabs with onSelect and a node as is', async () => {
    const onSelect = vi.fn();
    await renderInRouter(<PhoneTabBar tabs={[{ id: 'feeds', label: 'Feeds', line: 'list', onSelect }, { id: 'more', label: 'More', node: <button type="button">Spaces</button> }]} activeId={null} />);
    fireEvent.click(screen.getByRole('button', { name: 'Feeds' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Spaces' })).toBeInTheDocument();
  });

  it('hides while the on-screen keyboard is open, unless told not to, and lifts by bottomInset', async () => {
    const viewport = new EventTarget() as EventTarget & { height: number };
    viewport.height = 400;
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    const { unmount } = await renderInRouter(<PhoneTabBar tabs={TABS} activeId={null} />);
    act(() => void viewport.dispatchEvent(new Event('resize')));
    expect(screen.queryByRole('navigation')).toBeNull();
    unmount();
    await renderInRouter(<PhoneTabBar tabs={TABS} activeId={null} hideOnKeyboard={false} bottomInset={300} />);
    expect(screen.getByRole('navigation').style.bottom).toContain('300px');
    Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
  });
});
