/**
 * @file Toast.tsx
 * @description Toast notification system with undo support
 * 
 * Provides brief toast notifications with optional undo action
 * for destructive operations like delete, complete, etc.
 * 
 * The timer pauses while the pointer or the focus is on a toast, so an Undo is never taken from under a hand.
 * An action can show a countdown (seconds left), and the `pill` variant is Lighthouse's dark pill.
 * The timer is ported from lighthouse@dd62578:frontend/src/components/ui/ToastHost.tsx.
 *
 * Positioning:
 * - Mobile: Bottom right (avoid FAB)
 * - Desktop: Bottom center (avoid FAB overlap)
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { XIcon } from '@frameer/components/common/Icons';
import { ChromeIcon, type ChromeIconName } from './ChromeIcons';
import { useIsMobile } from '@frameer/hooks/useMobileDetection';
import { createPausableTimer, type PausableTimer } from '@frameer/lib/pausableTimer';

// ============================================================================
// TOAST STORE
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

export type ToastVariant = 'tinted' | 'pill';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  /** Optional undo action */
  onUndo?: () => void;
  /** Optional custom action */
  action?: ToastAction;
  /** Duration in ms (default: 4000) */
  duration?: number;
  /** Whether the toast is dismissible */
  dismissible?: boolean;
  /** `tinted` (default) takes the type's color; `pill` is the dark pill */
  variant?: ToastVariant;
  /** Show the seconds left beside the action or Undo */
  countdown?: boolean;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
      dismissible: toast.dismissible ?? true,
    };
    
    // The toast's own component runs the timer, so hover and focus can pause it.
    set({ toasts: [...get().toasts, newToast] });
    return id;
  },
  
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
  
  clearAll: () => {
    set({ toasts: [] });
  },
}));

// ============================================================================
// TOAST HELPERS
// ============================================================================

/**
 * Show a success toast
 */
export function toastSuccess(message: string, onUndo?: () => void) {
  return useToastStore.getState().addToast({
    type: 'success',
    message,
    onUndo,
  });
}

/**
 * Show an error toast
 */
export function toastError(message: string) {
  return useToastStore.getState().addToast({
    type: 'error',
    message,
    duration: 6000, // Errors stay longer
  });
}

/**
 * Show a warning toast
 */
export function toastWarning(message: string) {
  return useToastStore.getState().addToast({
    type: 'warning',
    message,
  });
}

/**
 * Show an info toast
 */
export function toastInfo(message: string) {
  return useToastStore.getState().addToast({
    type: 'info',
    message,
  });
}

/**
 * Show a success toast with a custom action button
 */
export function toastSuccessWithAction(
  message: string, 
  action: { label: string; onClick: () => void }
) {
  return useToastStore.getState().addToast({
    type: 'success',
    message,
    action,
    duration: 5000, // Give user time to see and click the action
  });
}

/**
 * Show a message with one action (usually Undo), a countdown beside it and the dark pill look.
 * The toast stays 8 seconds and pauses while the pointer or the focus is on it.
 */
export function toastWithAction(
  message: string,
  action: { label: string; onClick: () => void },
  options: { duration?: number; variant?: ToastVariant; countdown?: boolean; type?: ToastType } = {},
) {
  return useToastStore.getState().addToast({
    type: options.type ?? 'success',
    message,
    action,
    duration: options.duration ?? 8000,
    variant: options.variant ?? 'pill',
    countdown: options.countdown ?? true,
  });
}

// ============================================================================
// TOAST COMPONENT
// ============================================================================

const typeConfig = {
  success: {
    icon: 'checkCircle' as ChromeIconName,
    bgClass: 'bg-[var(--color-success)]/10',
    borderClass: 'border border-[var(--color-success)]/15',
    iconClass: 'text-[var(--color-success)]',
    textClass: 'text-[var(--color-success)]',
  },
  error: {
    icon: 'alertCircle' as ChromeIconName,
    bgClass: 'bg-[var(--color-danger)]/10',
    borderClass: 'border border-[var(--color-danger)]/15',
    iconClass: 'text-[var(--color-danger)]',
    textClass: 'text-[var(--color-danger)]',
  },
  warning: {
    icon: 'alertTriangle' as ChromeIconName,
    bgClass: 'bg-[var(--color-warning)]/10',
    borderClass: 'border border-[var(--color-warning)]/15',
    iconClass: 'text-[var(--color-warning)]',
    textClass: 'text-[var(--color-warning)]',
  },
  info: {
    icon: 'info' as ChromeIconName,
    bgClass: 'bg-[var(--color-accent-muted)]',
    borderClass: 'border border-[var(--color-accent-emphasis)]/15',
    iconClass: 'text-[var(--color-accent-fg)]',
    textClass: 'text-[var(--color-accent-fg)]',
  },
};

interface ToastItemComponentProps {
  toast: ToastItem;
  onRemove: () => void;
}

const ToastItemComponent: React.FC<ToastItemComponentProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil((toast.duration ?? 0) / 1000));
  const timer = useRef<PausableTimer | null>(null);
  const config = typeConfig[toast.type];
  const pill = toast.variant === 'pill';

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(onRemove, 150);
  }, [onRemove]);

  // The countdown runs here, not in the store, so hover and focus can pause it.
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    const t = createPausableTimer(toast.duration, handleRemove);
    timer.current = t;
    const tick = toast.countdown ? setInterval(() => setSecondsLeft(Math.ceil(t.remaining() / 1000)), 250) : null;
    return () => {
      t.cancel();
      if (tick) clearInterval(tick);
    };
  }, [toast.duration, toast.countdown, handleRemove]);

  const handleUndo = useCallback(() => {
    toast.onUndo?.();
    handleRemove();
  }, [toast, handleRemove]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      data-testid="toast"
      data-variant={pill ? 'pill' : 'tinted'}
      onPointerEnter={() => timer.current?.pause()}
      onPointerLeave={() => timer.current?.resume()}
      onFocus={() => timer.current?.pause()}
      onBlur={() => timer.current?.resume()}
      className={`
        flex items-center gap-3 shadow-lg backdrop-blur-sm
        ${pill ? 'min-h-11 rounded-full bg-[var(--ink)] pl-[18px] pr-2 text-[var(--paper)]' : `px-4 py-3 rounded-xl ${config.bgClass} ${config.borderClass}`}
        transition-all duration-150 ease-out
        ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
        toast-enter
      `}
    >
      {pill ? null : <ChromeIcon name={config.icon} size={18} className={config.iconClass} strokeWidth={1.75} />}
      
      <span className={`flex-1 text-sm font-medium ${pill ? '' : config.textClass}`}>
        {toast.message}
      </span>

      {toast.onUndo && (
        <button
          onClick={handleUndo}
          className={`
            flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
            hover:bg-black/5 dark:hover:bg-white/10 transition-colors
            ${pill ? 'text-[var(--paper)]' : config.textClass}
          `}
        >
          <ChromeIcon name="undo" size={14} />
          Undo
          {toast.countdown ? <span aria-hidden="true" className="tabular-nums opacity-70">{secondsLeft}</span> : null}
        </button>
      )}

      {toast.action && (
        <button
          onClick={() => {
            toast.action?.onClick();
            handleRemove();
          }}
          className={`
            px-2 py-1 rounded text-xs font-medium
            hover:bg-black/5 dark:hover:bg-white/10 transition-colors
            ${pill ? 'text-[var(--paper)]' : config.textClass}
          `}
        >
          {toast.action.label}
          {toast.countdown ? <span aria-hidden="true" className="tabular-nums opacity-70">{secondsLeft}</span> : null}
        </button>
      )}

      {toast.dismissible && (
        <button
          onClick={handleRemove}
          className={`
            p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors
            ${pill ? 'text-[var(--paper)]' : config.iconClass}
          `}
          aria-label="Dismiss"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ============================================================================
// TOAST CONTAINER
// ============================================================================

/**
 * Toast container - renders all active toasts
 * Should be included once at the app root level
 * 
 * Positioning:
 * - Mobile: Bottom right (safe area for FAB)
 * - Desktop: Bottom center (prevents FAB overlap)
 */
export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setContainer(document.body);
  }, []);

  if (!container || toasts.length === 0) return null;

  return createPortal(
    <div 
      className={`fixed z-[150] flex flex-col gap-2 max-w-sm ${
        isMobile 
          ? 'bottom-[var(--toast-offset,1rem)] right-4' 
          : 'bottom-[var(--toast-offset,1rem)] left-1/2 -translate-x-1/2'
      }`}
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom)',
        ...(isMobile && { paddingRight: 'env(safe-area-inset-right)' }),
      }}
    >
      {toasts.map((toast) => (
        <ToastItemComponent
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    container
  );
};

export default ToastContainer;
