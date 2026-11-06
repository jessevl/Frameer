/**
 * @file ChromeIcons.fixes.test.tsx
 * @description A chrome icon can be labelled (`role`, `aria-label`); the ShortcutSheet `header` slot renders above the list; with axe.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import { ChromeIcon } from './ChromeIcons';
import { ShortcutSheet } from './ShortcutSheet';

describe('ChromeIcon labels', () => {
  it('takes role and aria-label', async () => {
    render(<ChromeIcon name="alertTriangle" role="img" aria-label="Warning" />);
    expect(screen.getByRole('img', { name: 'Warning' })).toHaveAttribute('data-chrome', 'alertTriangle');
    expect(await axeViolations()).toEqual([]);
  });
});

describe('ShortcutSheet header', () => {
  it('shows the header above the list', () => {
    render(<ShortcutSheet rows={[{ keys: ['?'], label: 'Help' }]} onClose={() => {}} header={<img alt="Keys" src="data:," />} />);
    const img = screen.getByAltText('Keys');
    const list = screen.getByTestId('shortcut-list');
    expect(img.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
