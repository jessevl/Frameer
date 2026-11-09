/**
 * @file Modal.test.tsx
 * @description Modal's keyboard rules (Escape closes only the top dialog, focus moves in to `data-autofocus` or the first control, Tab stays inside, focus returns), AdaptiveDialog as a dialog on a desktop window and a sheet on a phone, ConfirmModal with children, and accessibility.
 */
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import { ConfirmModal } from '../index';
import { useConfirmStore } from '../../stores/confirmStore';
import { AdaptiveDialog } from './AdaptiveDialog';
import Modal from './Modal';

function Host({ onClose = vi.fn() }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      <Modal isOpen={open} onClose={() => { onClose(); setOpen(false); }} title="Edit" footer={<button type="button">Save</button>}>
        <input aria-label="Name" />
        <input aria-label="Notes" data-autofocus />
      </Modal>
    </>
  );
}

afterEach(() => {
  useConfirmStore.getState().cancel();
});

describe('Modal keyboard', () => {
  it('moves focus to data-autofocus, keeps Tab inside, and gives focus back', async () => {
    const onClose = vi.fn();
    render(<Host onClose={onClose} />);
    const opener = screen.getByRole('button', { name: 'Open' });
    opener.focus();
    fireEvent.click(opener);
    expect(await screen.findByRole('dialog', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toHaveFocus();

    const save = screen.getByRole('button', { name: 'Save' });
    save.focus();
    fireEvent.keyDown(save, { key: 'Tab' });
    expect(document.activeElement).not.toBe(opener);
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
    const first = screen.getByRole('button', { name: 'Close' });
    first.focus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(save).toHaveFocus();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
  });

  it('lets only the top dialog answer Escape', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Modal isOpen onClose={outer} title="Outer"><input aria-label="a" /></Modal>
        <Modal isOpen onClose={inner} title="Inner"><input aria-label="b" /></Modal>
      </>,
    );
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(inner).toHaveBeenCalledOnce();
    expect(outer).not.toHaveBeenCalled();
  });

  it('has no axe violations while open', async () => {
    render(<Modal isOpen onClose={vi.fn()} title="Edit"><input aria-label="Name" /></Modal>);
    expect(await axeViolations()).toEqual([]);
  });
});

describe('AdaptiveDialog', () => {
  it('is a dialog on a desktop window', async () => {
    render(<AdaptiveDialog onClose={vi.fn()} title="Swap" footer={<button type="button">Do it</button>}><p>Body</p></AdaptiveDialog>);
    expect(await screen.findByRole('dialog', { name: 'Swap' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument();
    expect(await axeViolations()).toEqual([]);
  });

  it('is a sheet on a phone window and keeps the footer', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ matches: true, media: query, onchange: null, addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() })) as typeof window.matchMedia;
    try {
      render(<AdaptiveDialog onClose={vi.fn()} title="Swap" footer={<button type="button">Do it</button>}><p>Body</p></AdaptiveDialog>);
      expect(await screen.findByText('Body')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: 'Swap' })).not.toHaveClass('max-w-md');
    } finally {
      window.matchMedia = original;
    }
  });
});

describe('ConfirmModal', () => {
  it('shows children that name what is lost, and confirms', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal><ul><li>3 guests</li></ul></ConfirmModal>);
    act(() => useConfirmStore.getState().requestConfirm({ title: 'Delete', message: 'Delete this event?', confirmLabel: 'Delete', variant: 'danger', onConfirm }));
    expect(await screen.findByText('3 guests')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Delete' })).toBeInTheDocument();
    expect(await axeViolations()).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('shows the title as a heading with showTitle, so the question names the item', async () => {
    render(<ConfirmModal showTitle />);
    act(() => useConfirmStore.getState().requestConfirm({ title: 'Delete Sports day?', message: 'This removes the event.', confirmLabel: 'Delete', variant: 'danger', onConfirm: vi.fn() }));
    expect(await screen.findByRole('heading', { name: 'Delete Sports day?' })).toBeVisible();
    expect(await axeViolations()).toEqual([]);
  });
});

describe('Modal titleStyle', () => {
  it('draws the title as a small uppercase kicker by default', () => {
    render(<Modal isOpen onClose={vi.fn()} title="Edit"><p>Body</p></Modal>);
    expect(screen.getByRole('heading', { name: 'Edit' }).className).toContain('uppercase');
  });

  it('draws a plain big heading with titleStyle="heading"', () => {
    render(<Modal isOpen onClose={vi.fn()} title="Move Photos" titleStyle="heading"><p>Body</p></Modal>);
    const h = screen.getByRole('heading', { name: 'Move Photos' });
    expect(h.className).not.toContain('uppercase');
    expect(h.className).toContain('font-bold');
    expect(h.className).toContain('text-[26px]');
  });
});
