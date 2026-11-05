/**
 * @file ConfirmModal.tsx
 * @description Generic confirmation modal
 * @app SHARED - Renders at app level to confirm various actions
 * 
 * Listens to confirmStore and displays confirmation when requested.
 * Supports different variants (default, warning, danger) for visual styling.
 * 
 * Render this once at the app level (e.g., in page.tsx or layout).
 */
'use client';

import React, { type ReactNode } from 'react';
import { Modal, Text, ModalFooter } from '@frameer/components/ui';
import { useConfirmStore, type ConfirmVariant } from '@frameer/stores/confirmStore';

/** `children` names what is lost (a list, a count); the store's own `children` from requestConfirm shows too. */
const ConfirmModal: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { 
    isOpen, 
    title, 
    message, 
    detail, 
    confirmLabel, 
    cancelLabel, 
    variant,
    children: requested,
    confirm, 
    cancel 
  } = useConfirmStore();
  
  const buttonVariant = variant === 'danger' ? 'danger' : 'primary';
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={cancel} 
      title={title}
      hideHeader
      footer={
        <ModalFooter
          onCancel={cancel}
          cancelLabel={cancelLabel}
          onSubmit={confirm}
          submitLabel={confirmLabel}
          submitVariant={buttonVariant}
        />
      }
    >
      <Text>{message}</Text>
      {detail && (
        <Text className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {detail}
        </Text>
      )}
      {requested}
      {children}
    </Modal>
  );
};

export default ConfirmModal;
