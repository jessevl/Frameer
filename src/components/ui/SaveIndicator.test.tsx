/**
 * @file SaveIndicator.test.tsx
 * @description SaveIndicator: the words of each state, hidden but in place while idle, resting on "Saved", custom words, a problem replacing the mark, both variants, and axe.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import { SaveIndicator } from './SaveIndicator';

describe('SaveIndicator', () => {
  it('says what each state is', () => {
    const { rerender } = render(<SaveIndicator status="saving" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saving');
    rerender(<SaveIndicator status="saved" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    rerender(<SaveIndicator status="failed" />);
    expect(screen.getByRole('status')).toHaveTextContent('Could not save');
  });

  it('keeps its place and hides from assistive technology while idle', () => {
    const { container } = render(<SaveIndicator status="idle" testId="save" />);
    const el = container.querySelector('[data-testid="save"]');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('opacity-0');
    expect(el?.textContent).toBe('Saved');
  });

  it('rests on Saved when idle="saved"', () => {
    render(<SaveIndicator status="idle" idle="saved" />);
    const el = screen.getByRole('status');
    expect(el).not.toHaveAttribute('aria-hidden');
    expect(el).toHaveClass('opacity-100');
  });

  it('takes the app\'s words, and a problem replaces the mark', () => {
    const { container, rerender } = render(<SaveIndicator status="saved" labels={{ saved: 'Saved on this device' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Saved on this device');
    rerender(<SaveIndicator status="failed" problem="Read-only calendar" />);
    expect(screen.getByRole('status')).toHaveTextContent('Read-only calendar');
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('draws the check variant with a check that shows once saved', () => {
    const { container, rerender } = render(<SaveIndicator status="saving" variant="check" />);
    expect(container.querySelector('[data-chrome="check"]')).toHaveClass('opacity-0');
    rerender(<SaveIndicator status="saved" variant="check" />);
    expect(container.querySelector('[data-chrome="check"]')).toHaveClass('opacity-100');
  });

  it('has no axe violations', async () => {
    render(
      <>
        <SaveIndicator status="saving" />
        <SaveIndicator status="saved" variant="check" />
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
