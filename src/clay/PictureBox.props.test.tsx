/**
 * @file PictureBox.props.test.tsx
 * @description PictureBox passes data-* and other div props through; lazyPicture infers its props for a default export and for a named export given by name, without a generic.
 */
import React from 'react';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PictureBox, lazyPicture } from './PictureBox';

const Scene: React.FC<{ tone: string }> = ({ tone }) => <span data-testid="scene">{tone}</span>;
const scenes = { Scene, other: 3 };

describe('PictureBox rest props', () => {
  it('passes data-* and id to the box', () => {
    render(<PictureBox label="x" data-testid="box" id="b" data-scene="harbour" />);
    expect(screen.getByTestId('box')).toHaveAttribute('data-scene', 'harbour');
    expect(screen.getByTestId('box')).toHaveAttribute('id', 'b');
    expect(screen.getByRole('img', { name: 'x' })).toBe(screen.getByTestId('box'));
  });

  it('keeps aria-hidden for decoration even with rest props', () => {
    render(<PictureBox data-testid="box" />);
    expect(screen.getByTestId('box')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('lazyPicture types', () => {
  it('infers the props of a default export and of a named export', async () => {
    const A = lazyPicture(async () => ({ default: Scene }));
    const B = lazyPicture(async () => scenes, 'Scene');
    expectTypeOf(A).toEqualTypeOf<React.ComponentType<{ tone: string }>>();
    expectTypeOf(B).toEqualTypeOf<React.ComponentType<{ tone: string }>>();
    render(
      <PictureBox>
        <B tone="calm" />
      </PictureBox>,
    );
    expect(await screen.findByTestId('scene')).toHaveTextContent('calm');
  });
});
