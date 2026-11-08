/**
 * @file Rail.test.tsx
 * @description Rail: sections as links and buttons, the current one marked, the mark as a link or a button, the slots (leading, between, footer), `renderSection` wrapping, the pane's hover handlers on the sections or the whole rail, and axe.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { renderInRouter } from '../test/router';
import { Rail, RailLink, type RailSection } from './Rail';

const SECTIONS: RailSection[] = [
  { id: 'mail', label: 'Mail', line: 'list', to: '/mail' },
  { id: 'cal', label: 'Calendar', line: 'panel', to: '/calendar', title: 'Calendar (g c)' },
];
const MARK = <span data-testid="mark" />;

describe('Rail', () => {
  it('draws the sections as links, marks the current one and keeps the rail test id', async () => {
    await renderInRouter(<Rail mark={MARK} markLabel="Home" markHref="/" sections={SECTIONS} activeId="cal" footer={<span>foot</span>} />);
    expect(screen.getByTestId('rail')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Mail' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Calendar' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Calendar' })).toHaveAttribute('title', 'Calendar (g c)');
    expect(screen.getByText('foot')).toBeInTheDocument();
    expect(await axeViolations()).toEqual([]);
  });

  it('draws a section with onSelect as a button and the mark as a button without a route', async () => {
    const onSelect = vi.fn();
    const onMark = vi.fn();
    await renderInRouter(<Rail mark={MARK} markLabel="Go to Today" onMark={onMark} sections={[{ id: 'feeds', label: 'Feeds', line: 'search', onSelect }]} activeId={null} />);
    fireEvent.click(screen.getByRole('button', { name: 'Feeds' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to Today' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onMark).toHaveBeenCalledTimes(1);
  });

  it('puts the slots in order: mark, leading, sections, between, footer', async () => {
    await renderInRouter(<Rail mark={MARK} markLabel="Home" markHref="/" sections={SECTIONS} leading={<i data-testid="leading" />} between={<i data-testid="between" />} footer={<i data-testid="footer" />} />);
    const order = ['mark', 'leading', 'between', 'footer'].map((id) => screen.getByTestId(id));
    for (let i = 1; i < order.length; i += 1) {
      expect(order[i - 1]?.compareDocumentPosition(order[i] as Node) ?? 0).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    }
    expect(screen.getByTestId('leading').compareDocumentPosition(screen.getByRole('link', { name: 'Mail' }))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('lets the app wrap a section through renderSection', async () => {
    await renderInRouter(<Rail mark={MARK} markLabel="Home" markHref="/" sections={SECTIONS} renderSection={(section, link) => <div data-testid={`wrap-${section.id}`}>{link}</div>} />);
    expect(screen.getByTestId('wrap-mail')).toContainElement(screen.getByRole('link', { name: 'Mail' }));
  });

  it('hands the pane hover to the sections, or to the whole rail', async () => {
    const hover = { onPointerEnter: vi.fn(), onPointerLeave: vi.fn() };
    const { unmount } = await renderInRouter(<Rail mark={MARK} markLabel="Home" markHref="/" sections={SECTIONS} hover={hover} />);
    fireEvent.pointerEnter(screen.getByTestId('rail'));
    expect(hover.onPointerEnter).not.toHaveBeenCalled();
    fireEvent.pointerEnter(screen.getByRole('navigation', { name: 'Sections' }));
    expect(hover.onPointerEnter).toHaveBeenCalledTimes(1);
    unmount();
    await renderInRouter(<Rail mark={MARK} markLabel="Home" markHref="/" sections={SECTIONS} hover={hover} hoverScope="rail" />);
    fireEvent.pointerEnter(screen.getByTestId('rail'));
    expect(hover.onPointerEnter).toHaveBeenCalledTimes(2);
  });

  it('cuts its line icons out of --paper, the sidebar card\'s fill', async () => {
    await renderInRouter(<Rail mark={MARK} markLabel="Home" markHref="/" sections={SECTIONS} activeId="cal" />);
    expect(screen.getByTestId('rail')).toHaveClass('[--icon-bg:var(--paper)]');
  });

  it('draws a footer link like a section with RailLink', async () => {
    await renderInRouter(<RailLink section={{ id: 'settings', label: 'Settings', line: 'settings', to: '/settings' }} active />);
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
  });
});
