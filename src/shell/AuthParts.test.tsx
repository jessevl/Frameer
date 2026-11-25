/**
 * @file AuthParts.test.tsx
 * @description The shared sign-in parts: AuthBrand (name shown, mark hidden), AuthMarkTile (moving on its own), AuthEmailInput (label, placeholder), KeepSignedIn (toggles), AuthHint and AuthLink, serverStatusLine's words, and axe on a whole sign-in screen built from them.
 * Ported from drift@b9fe5ae1:frontend/src/features/auth/serverStatus.test.ts.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../test/axe';
import { AuthArt, AuthShell } from './AuthShell';
import { AuthBrand, AuthEmailInput, AuthHint, AuthLink, AuthMarkTile, KeepSignedIn, serverStatusLine } from './AuthParts';

describe('AuthBrand and AuthMarkTile', () => {
  it('shows the name and hides the mark from assistive technology', () => {
    const { container } = render(<AuthBrand app="reel" name="Reel" />);
    expect(screen.getByText('Reel')).toBeTruthy();
    expect(container.querySelector('[aria-hidden="true"] svg')).toBeTruthy();
  });

  it('draws the large paper mark, moving on its own', () => {
    render(<AuthMarkTile app="hearth" />);
    const moving = screen.getByTestId('auth-mark-tile').querySelector('[data-working="true"] svg');
    expect(moving?.getAttribute('width')).toBe('190');
  });
});

describe('the form parts', () => {
  it('labels the e-mail field and reports what is typed', () => {
    const onChange = vi.fn();
    render(<AuthEmailInput value="" onChange={onChange} />);
    const field = screen.getByLabelText('Email address');
    expect(field.getAttribute('placeholder')).toBe('you@example.com');
    fireEvent.change(field, { target: { value: 'a@b.c' } });
    expect(onChange).toHaveBeenCalledWith('a@b.c');
  });

  it('toggles Keep me signed in', () => {
    const onChange = vi.fn();
    render(<KeepSignedIn checked onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Keep me signed in'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('builds a sign-in screen with no axe violations', async () => {
    render(
      <AuthShell brand={<AuthBrand app="drift" name="Drift" />} title="Welcome back" footnote="Your files stay on this server." art={<AuthArt caption="All of it yours."><AuthMarkTile app="drift" /></AuthArt>}>
        <form aria-label="Sign in">
          <AuthEmailInput value="" onChange={() => {}} autoFocus={false} />
          <KeepSignedIn checked onChange={() => {}} />
          <AuthHint small>Forgot your password? Ask the person who runs this server to reset it.</AuthHint>
          <AuthHint>
            Joining a team? <AuthLink onClick={() => {}}>Ask for an invite</AuthLink>
          </AuthHint>
        </form>
      </AuthShell>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});

describe('serverStatusLine', () => {
  it('names the server, its state and a v-prefixed version', () => {
    expect(serverStatusLine({ name: 'drift.home', version: '0.9', loading: false, failed: false })).toEqual({ text: 'drift.home · online · v0.9', online: true });
  });

  it('keeps a non-numeric version as it is and omits an empty one', () => {
    expect(serverStatusLine({ name: 'a', version: 'dev', loading: false, failed: false }).text).toBe('a · online · dev');
    expect(serverStatusLine({ name: 'a', version: '', loading: false, failed: false }).text).toBe('a · online');
  });

  it('reports a pending or failed fetch', () => {
    expect(serverStatusLine({ name: 'a', version: '', loading: true, failed: false })).toEqual({ text: 'a · checking…', online: false });
    expect(serverStatusLine({ name: 'a', version: '1', loading: false, failed: true })).toEqual({ text: 'a · offline', online: false });
  });
});
