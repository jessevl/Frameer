/**
 * @file AuthShell.test.tsx
 * @description AuthShell in its three layouts (heading order, brand, chip, form, footnote, art slot), ServerStatusChip, FormError and AuthArt (tiles, picture, hidden from assistive technology), and axe.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { AuthArt, AuthShell, FormError, ServerStatusChip } from './AuthShell';

const props = {
  brand: <span>Harbour</span>,
  status: <ServerStatusChip online>harbour.home · online</ServerStatusChip>,
  title: 'Sign in',
  subtitle: 'Welcome back',
  footnote: 'Your mail stays on this server.',
};

describe('AuthShell', () => {
  it('lays out the split page: brand, chip, one h1, form, footnote and art', () => {
    render(
      <AuthShell {...props} art={<AuthArt caption="Mail for the household" />}>
        <form aria-label="Sign in form" />
      </AuthShell>,
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Harbour')).toBeInTheDocument();
    expect(screen.getByTestId('server-status')).toHaveTextContent('harbour.home · online');
    expect(screen.getByText('Your mail stays on this server.')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Sign in form' })).toBeInTheDocument();
    expect(document.querySelector('[data-auth-art]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('lays out the window variant with the art in it', () => {
    const { container } = render(
      <AuthShell {...props} variant="window" art={<AuthArt />}>
        <p>form</p>
      </AuthShell>,
    );
    expect(container.querySelector('[data-auth-art]')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('lays out the card variant without art or footnote', () => {
    render(
      <AuthShell {...props} variant="card" art={<AuthArt />}>
        <p>form</p>
      </AuthShell>,
    );
    expect(document.querySelector('[data-auth-art]')).toBeNull();
    expect(screen.queryByText('Your mail stays on this server.')).toBeNull();
    expect(screen.getByRole('main')).toHaveTextContent('Sign in');
  });

  it('marks an unreachable server with a grey dot', () => {
    const { container } = render(<ServerStatusChip online={false}>offline</ServerStatusChip>);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass('bg-[var(--ink-3)]');
  });

  it('shows a form error as an alert and nothing without one', () => {
    const { rerender } = render(<FormError message="Wrong password" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Wrong password');
    rerender(<FormError message={null} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('draws outline tiles in their hue and custom nodes', () => {
    const { container } = render(
      <AuthArt
        tiles={[
          { hue: 'green', x: '10%', y: '10%', size: 60, rotate: 4, delay: 0 },
          { node: <i data-testid="jar" />, x: '50%', y: '50%', size: 40, rotate: 0, delay: 1 },
        ]}
      >
        <svg />
      </AuthArt>,
    );
    expect(container.querySelectorAll('.signin-tile')).toHaveLength(2);
    expect(screen.getByTestId('jar')).toBeInTheDocument();
    expect(container.querySelector<HTMLElement>('.signin-tile')?.style.border).toContain('--hue-green-stroke');
  });

  it('has no axe violations', async () => {
    render(
      <AuthShell {...props} art={<AuthArt caption="x" />}>
        <FormError message="Wrong password" />
        <label>
          Email <input type="email" />
        </label>
      </AuthShell>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
