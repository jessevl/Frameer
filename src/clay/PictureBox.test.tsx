/**
 * @file PictureBox.test.tsx
 * @description PictureBox: an image with a label, hidden without one, nothing until a lazy child has loaded, and axe.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { PictureBox, lazyPicture } from './PictureBox';

describe('PictureBox', () => {
  it('is an image with a label', () => {
    render(<PictureBox label="The yard: 4 apps, all running." className="h-10" />);
    expect(screen.getByRole('img', { name: 'The yard: 4 apps, all running.' })).toHaveClass('h-10');
  });

  it('is hidden from assistive technology without a label', () => {
    const { container } = render(<PictureBox className="h-10" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows nothing until a lazy child has loaded, then the child', async () => {
    const Lazy = lazyPicture(async () => ({ default: () => <span data-testid="canvas" /> }));
    render(
      <PictureBox>
        <Lazy />
      </PictureBox>,
    );
    expect(screen.queryByTestId('canvas')).toBeNull();
    expect(await screen.findByTestId('canvas')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    render(<PictureBox label="A harbour" />);
    expect(await axeViolations()).toEqual([]);
  });
});
