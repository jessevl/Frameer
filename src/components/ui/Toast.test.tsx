/**
 * @file Toast.test.tsx
 * @description The toast: it goes after its duration, pauses while the pointer or the focus is on it, shows the seconds left beside an action, runs the action once, wears the pill variant, and has no axe violations.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axeViolations } from '../../test/axe';
import { ToastContainer, toastInfo, toastWithAction, useToastStore } from './Toast';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  act(() => useToastStore.getState().clearAll());
  vi.useRealTimers();
});

describe('Toast', () => {
  it('goes after its duration', () => {
    render(<ToastContainer />);
    act(() => { toastInfo('Saved'); });
    expect(screen.getByText('Saved')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(4200); });
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('pauses on hover and on focus, and keeps the time left', () => {
    render(<ToastContainer />);
    act(() => { toastWithAction('Moved', { label: 'Undo', onClick: vi.fn() }, { duration: 4000 }); });
    const toast = screen.getByTestId('toast');
    act(() => { vi.advanceTimersByTime(3000); });
    fireEvent.pointerEnter(toast);
    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByText('Moved')).toBeInTheDocument();
    fireEvent.pointerLeave(toast);
    act(() => { vi.advanceTimersByTime(900); });
    expect(screen.getByText('Moved')).toBeInTheDocument();
    fireEvent.focus(toast);
    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByText('Moved')).toBeInTheDocument();
    fireEvent.blur(toast);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryByText('Moved')).toBeNull();
  });

  it('shows the seconds left beside the action and runs it once', async () => {
    const onClick = vi.fn();
    render(<ToastContainer />);
    act(() => { toastWithAction('Moved', { label: 'Undo', onClick }); });
    const button = screen.getByRole('button', { name: /Undo/ });
    expect(button).toHaveTextContent('8');
    act(() => { vi.advanceTimersByTime(3100); });
    expect(button).toHaveTextContent('5');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('wears the pill variant and passes axe', async () => {
    vi.useRealTimers();
    const { container } = render(<ToastContainer />);
    act(() => { toastWithAction('Moved', { label: 'Undo', onClick: vi.fn() }); });
    expect(screen.getByTestId('toast')).toHaveAttribute('data-variant', 'pill');
    expect(await axeViolations(document.body)).toEqual([]);
    expect(container).toBeDefined();
  });
});
