/**
 * @file AuthShell.fixes.test.tsx
 * @description The v0.4 adoption fixes: the `bare` card, FormError without a margin, AuthArt `tilesAbove`, and the parts barrel's exports, with axe. Also that every layout scrolls itself, since base.css turns off page scrolling.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { AuthArt, AuthShell, FormError } from './AuthShell';
import * as parts from './parts';
import * as own from './AuthShell';
import * as status from './StageStatus';

describe('AuthShell fixes', () => {
  it('renders the children of a bare card directly, with no heading or padded wrapper', async () => {
    render(
      <AuthShell brand={<span>Yard</span>} title="Set up" variant="card" wide bare>
        <section aria-label="Wizard" data-testid="wizard">
          <h1>Own heading</h1>
        </section>
      </AuthShell>,
    );
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(screen.getByTestId('wizard').parentElement).toBe(screen.getByRole('main'));
    expect(await axeViolations()).toEqual([]);
  });

  it.each(['split', 'window', 'card'] as const)('puts the %s layout in a window-high box that scrolls, as the page cannot', (variant) => {
    render(
      <AuthShell brand={<span>Yard</span>} title="Set up" variant={variant}>
        <p>form</p>
      </AuthShell>,
    );
    const box = screen.getByTestId('auth-scroll');
    expect(box).toHaveClass('h-dvh', 'overflow-y-auto');
    expect(box).toContainElement(screen.getByRole('main'));
  });

  it('keeps the heading and padding in a card that is not bare', () => {
    render(
      <AuthShell brand={<span>Yard</span>} title="Set up" variant="card">
        <p>form</p>
      </AuthShell>,
    );
    expect(screen.getByRole('heading', { name: 'Set up' })).toBeInTheDocument();
  });

  it("draws FormError with no margin of its own, and takes the caller's", () => {
    const { rerender } = render(<FormError message="No" />);
    expect(screen.getByRole('alert').className).not.toMatch(/(^|\s)m[bt]?-\d/);
    rerender(<FormError message="No" className="mb-4" />);
    expect(screen.getByRole('alert')).toHaveClass('mb-4');
  });

  it('puts the tiles over the picture on request', () => {
    const tiles = [{ hue: 'green' as const, x: '1%', y: '1%', size: 40, rotate: 0, delay: 0 }];
    const { container, rerender } = render(
      <AuthArt tiles={tiles}>
        <svg data-testid="pic" />
      </AuthArt>,
    );
    expect(container.querySelector<HTMLElement>('.signin-tile')?.style.zIndex).toBe('');
    rerender(
      <AuthArt tiles={tiles} tilesAbove>
        <svg data-testid="pic" />
      </AuthArt>,
    );
    expect(Number(container.querySelector<HTMLElement>('.signin-tile')?.style.zIndex)).toBeGreaterThan(1);
    expect(screen.getByTestId('pic').parentElement).toHaveClass('z-[1]');
  });

  it('exports the signed-out frame and the status line from the parts barrel, and from their own files', () => {
    expect(parts.AuthShell).toBe(own.AuthShell);
    expect(parts.AuthArt).toBe(own.AuthArt);
    expect(parts.FormError).toBe(own.FormError);
    expect(parts.ServerStatusChip).toBe(own.ServerStatusChip);
    expect(parts.StageStatus).toBe(status.StageStatus);
    expect(parts.StageStatusButton).toBe(status.StageStatusButton);
  });
});
