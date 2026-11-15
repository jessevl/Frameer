/**
 * @file AppFrame.test.tsx
 * @description AppFrame: the rail stands on the canvas outside the card, the docked pane is the card's first column (an `aside` with its label) before the positioned stage box, a pane that does not dock floats and leaves the card to the stage, a screen without a pane has no aside, the frame sets `--rail-surface` for the rail, and axe. Also the two defaults that follow the frame: the floating pane at 62 px and the rail's icons on `--rail-surface`.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { renderInRouter } from '../test/router';
import { AppFrame, FRAME_PANE_WIDTH } from './AppFrame';
import { FloatingPane } from './FloatingPane';
import { Rail } from './Rail';
import type { PaneState } from './usePane';

function paneState(over: Partial<PaneState> = {}): PaneState {
  return { docked: true, floating: false, open: false, forced: false, none: false, toggle: vi.fn(), close: vi.fn(), hover: { onPointerEnter: vi.fn(), onPointerLeave: vi.fn() }, ...over };
}

const RAIL = <nav aria-label="Sections" data-testid="rail-slot" />;
const STAGE = (
  <main id="main" data-testid="stage">
    <h1>Inbox</h1>
  </main>
);

describe('AppFrame', () => {
  it('puts the rail on the canvas, then one card with the docked pane before the stage', async () => {
    render(
      <AppFrame rail={RAIL} pane={<p>Folders</p>} paneState={paneState()} paneLabel="Mail">
        {STAGE}
      </AppFrame>,
    );
    const frame = screen.getByTestId('app-frame');
    const card = frame.querySelector('[data-frame-card]') as HTMLElement;
    expect(frame.firstElementChild).toBe(screen.getByTestId('rail-slot'));
    expect(card).not.toContainElement(screen.getByTestId('rail-slot'));
    expect(card.className).toContain('paper-surface');
    const pane = screen.getByRole('complementary', { name: 'Mail' });
    expect(card.firstElementChild).toBe(pane);
    expect(pane).toHaveTextContent('Folders');
    expect(pane.style.width).toBe(`${FRAME_PANE_WIDTH}px`);
    const stage = card.querySelector('[data-frame-stage]') as HTMLElement;
    expect(stage.className).toContain('relative');
    expect(stage).toContainElement(screen.getByTestId('stage'));
    expect(screen.queryByTestId('compact-pane')).toBeNull();
    expect(await axeViolations()).toEqual([]);
  });

  it('floats a pane that does not dock and leaves the card to the stage', () => {
    render(
      <AppFrame rail={RAIL} pane={<p>Folders</p>} paneState={paneState({ docked: false, floating: true, open: true })} floating={{ testId: 'float' }}>
        {STAGE}
      </AppFrame>,
    );
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(screen.getByTestId('float')).toHaveTextContent('Folders');
    const card = screen.getByTestId('app-frame').querySelector('[data-frame-card]') as HTMLElement;
    expect(card.firstElementChild?.hasAttribute('data-frame-stage')).toBe(true);
  });

  it('has no pane on a screen without one', () => {
    render(<AppFrame rail={RAIL}>{STAGE}</AppFrame>);
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(screen.queryByTestId('compact-pane')).toBeNull();
  });

  it('sets the rail surface to the canvas, and the rail occludes its icons with it', async () => {
    await renderInRouter(
      <AppFrame rail={<Rail mark={<span />} markLabel="Home" markHref="/" sections={[]} />}>
        {STAGE}
      </AppFrame>,
    );
    expect(screen.getByTestId('app-frame').className).toContain('[--rail-surface:var(--canvas)]');
    expect(screen.getByTestId('rail').className).toContain('[--icon-bg:var(--rail-surface,var(--paper))]');
  });
});

describe('FloatingPane', () => {
  it('sits at the left edge of the frame card, beside the 62 px rail', () => {
    render(
      <FloatingPane pane={paneState({ docked: false, floating: true, open: true })}>
        <p>Folders</p>
      </FloatingPane>,
    );
    expect(screen.getByTestId('compact-pane').className).toContain('left-[62px]');
  });
});
