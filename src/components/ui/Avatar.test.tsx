/**
 * @file Avatar.test.tsx
 * @description Avatar and AvatarStack: initials on the hue, the quiet glyph for an unknown name, a picture, the label that makes it an image, the "+N" chip, and axe.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import { Avatar, initialsOf } from './Avatar';
import { AvatarStack } from './AvatarStack';

describe('Avatar', () => {
  it('takes the initials of the first two words', () => {
    expect(initialsOf('Mara Vos')).toBe('MV');
    expect(initialsOf('mara')).toBe('M');
    expect(initialsOf('  ')).toBe('');
  });

  it('draws the initials on the hue and is hidden from assistive technology', () => {
    const { container } = render(<Avatar name="Mara Vos" hue="teal" />);
    const el = container.querySelector<HTMLElement>('[data-avatar]');
    expect(el?.textContent).toBe('MV');
    expect(el?.getAttribute('aria-hidden')).toBe('true');
    expect(el?.style.background).toContain('--hue-teal-fill');
  });

  it('draws a person glyph, not a question mark, for an unknown name', () => {
    const { container } = render(<Avatar name="" />);
    expect(container.textContent).toBe('');
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('draws a picture over the initials', () => {
    const { container } = render(<Avatar name="Mara Vos" hue="teal" src="/m.png" />);
    expect(container.querySelector('img')).not.toBeNull();
    expect(container.textContent).toBe('');
  });

  it('is an image with a name when it has a label, and passes axe', async () => {
    render(<Avatar name="Mara Vos" hue="blue" label="Mara Vos" />);
    expect(screen.getByRole('img', { name: 'Mara Vos' })).toBeTruthy();
    expect(await axeViolations()).toEqual([]);
  });
});

describe('AvatarStack', () => {
  const people = ['Ann Bo', 'Cy Di', 'Ed Fo', 'Gi Ha', 'Io Jo'].map((name) => ({ id: name, name, hue: 'green' as const }));

  it('shows three and a +N chip for the rest, named by the people', async () => {
    const { container } = render(<AvatarStack people={people} label="On this page" />);
    expect(container.querySelectorAll('[data-avatar]')).toHaveLength(3);
    expect(container.textContent).toContain('+2');
    expect(screen.getByRole('group').getAttribute('aria-label')).toBe('On this page: Ann Bo, Cy Di, Ed Fo, Gi Ha, Io Jo');
    expect(await axeViolations()).toEqual([]);
  });

  it('draws nothing for nobody', () => {
    const { container } = render(<AvatarStack people={[]} label="x" />);
    expect(container.firstChild).toBeNull();
  });
});
