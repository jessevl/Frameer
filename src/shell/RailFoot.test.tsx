/**
 * @file RailFoot.test.tsx
 * @description RailFoot puts the foot in the suite's order (sync, Settings, account) whatever order the slots are passed in, and leaves out a slot that is not given.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RailFoot } from './RailFoot';

describe('RailFoot', () => {
  it('orders sync, Settings, then the account', () => {
    render(<RailFoot account={<i data-testid="account" />} settings={<i data-testid="settings" />} sync={<i data-testid="sync" />} />);
    const [sync, settings, account] = ['sync', 'settings', 'account'].map((id) => screen.getByTestId(id));
    expect(sync?.compareDocumentPosition(settings!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(settings?.compareDocumentPosition(account!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('leaves out a slot an app does not have', () => {
    const { container } = render(<RailFoot settings={<i data-testid="settings" />} account={<i data-testid="account" />} />);
    expect(container.querySelectorAll('i')).toHaveLength(2);
  });
});
