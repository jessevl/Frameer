/**
 * @file StageStatus.test.tsx
 * @description StageStatus: dots between parts, empty parts skipped, nothing rendered when there is nothing to say, a polite live region, the trailing slot outside it, the button, and axe.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { StageStatus, StageStatusButton } from './StageStatus';

describe('StageStatus', () => {
  it('joins the parts with dots that assistive technology skips', () => {
    const { container } = render(<StageStatus parts={['23 events', '6 of 7 dinners planned']} testId="line" />);
    const live = screen.getByRole('status', { name: 'Status' });
    expect(live).toHaveAttribute('aria-live', 'polite');
    expect(live.textContent).toBe('23 events6 of 7 dinners planned');
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('skips empty parts', () => {
    const { container } = render(<StageStatus parts={['', null, '3 children', false]} />);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);
    expect(screen.getByRole('status').textContent).toBe('3 children');
  });

  it('renders nothing when there is nothing to say', () => {
    const { container } = render(<StageStatus parts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps the trailing hints outside the live region', () => {
    render(<StageStatus parts={['43 unread']} trailing="J K to move" trailingClassName="hide-narrow" label="Reading status" />);
    expect(screen.getByRole('status', { name: 'Reading status' }).textContent).toBe('43 unread');
    const hints = screen.getByText('J K to move');
    expect(hints).toHaveClass('hide-narrow');
    expect(screen.getByRole('status')).not.toContainElement(hints);
  });

  it('holds a button among the parts', () => {
    const onGo = vi.fn();
    render(<StageStatus parts={['23 events', <StageStatusButton key="go" onClick={onGo}>1 pick-up without a person</StageStatusButton>]} />);
    fireEvent.click(screen.getByRole('button', { name: '1 pick-up without a person' }));
    expect(onGo).toHaveBeenCalledOnce();
  });

  it('has no axe violations', async () => {
    render(<StageStatus parts={['23 events', <StageStatusButton key="go">Open</StageStatusButton>]} trailing="J K" />);
    expect(await axeViolations()).toEqual([]);
  });
});
