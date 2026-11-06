/**
 * @file WhatsNewCard.test.tsx
 * @description WhatsNewCard: the pill names the app and version, the changes sit behind Open, closing marks the release seen and drops the card, a seen release or a build without notes shows nothing, and axe.
 */
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import { createWhatsNew } from '../../lib/whatsNew';
import { WhatsNewCard } from './WhatsNewCard';

const b64 = (text: string) => Buffer.from(text, 'utf8').toString('base64');
const make = () => createWhatsNew({ seenKey: 'test.seen', version: '0.1.4', notes: b64('feat: greeting desk\nfix: sync') });

describe('WhatsNewCard', () => {
  beforeEach(() => localStorage.clear());

  it('shows the pill and the changes behind Open', () => {
    render(<WhatsNewCard source={make()} appName="Drift" picture={<span data-testid="pic" />} testId="card" />);
    expect(screen.getByRole('heading', { name: "What's new in Drift 0.1.4" })).toBeInTheDocument();
    expect(screen.getByText('2 changes')).toBeInTheDocument();
    expect(screen.getByTestId('pic')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('list', { name: 'Changes' })).toHaveTextContent('Greeting desk');
  });

  it('marks the release seen and goes away when the notes close', () => {
    const onSeen = vi.fn();
    const source = make();
    const { container } = render(<WhatsNewCard source={source} appName="Drift" onSeen={onSeen} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(source.isSeen()).toBe(true);
    expect(onSeen).toHaveBeenCalledOnce();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing for a release already read, or a build without notes', () => {
    localStorage.setItem('test.seen', '0.1.4');
    const { container } = render(<WhatsNewCard source={make()} appName="Drift" />);
    expect(container).toBeEmptyDOMElement();
    const none = render(<WhatsNewCard source={createWhatsNew({ seenKey: 'x', version: '', notes: '' })} appName="Drift" />);
    expect(none.container).toBeEmptyDOMElement();
  });

  it('has no axe violations, closed and open', async () => {
    render(<WhatsNewCard source={make()} appName="Drift" />);
    expect(await axeViolations()).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(await axeViolations()).toEqual([]);
  });
});
