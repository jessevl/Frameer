/**
 * @file AdaptiveDialog.tsx
 * @description A dialog on the desktop and a bottom sheet below 768 px (the shell's width rule, not the device), with the same props either way, so every dialog follows the phone rule "every dialog is a sheet" with one switch. The footer sits under the content in both.
 * Ported from harbour@5c14cd3:frontend/src/ui/AdaptiveDialog.tsx, widened with `isOpen`, `footer` and `hideHeader`.
 * Used by: the apps' dialogs (care, meals, settings).
 */
import type { ReactNode } from 'react';
import { useIsMobile } from '@frameer/shell/useShellMode';
import MobileSheet from './MobileSheet';
import Modal from './Modal';

export interface AdaptiveDialogProps {
  /** Defaults to true, for callers that mount the dialog only while it is open. */
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  /** The desktop dialog's width; a sheet is always full width. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  children: ReactNode;
  footer?: ReactNode;
  /** The sheet's tallest height (default 92vh). */
  sheetMaxHeight?: string;
}

export function AdaptiveDialog({ isOpen = true, onClose, title, size = 'md', children, footer, sheetMaxHeight = '92vh' }: AdaptiveDialogProps) {
  const mobile = useIsMobile();
  if (mobile) {
    return (
      <MobileSheet isOpen={isOpen} onClose={onClose} title={title} maxHeight={sheetMaxHeight}>
        <div className="px-4 pb-4">
          {children}
          {footer ? <div className="mt-4 flex justify-end gap-2">{footer}</div> : null}
        </div>
      </MobileSheet>
    );
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size} footer={footer}>
      {children}
    </Modal>
  );
}

export default AdaptiveDialog;
