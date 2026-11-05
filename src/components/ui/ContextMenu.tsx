/**
 * @file ContextMenu.tsx
 * @description A wrapper that gives its children a context menu: on a right click (with a long press on touch and the Menu key), or on a click with `trigger="click"` for a menu button. It is useContextMenu around a `div`; new code can call the hook on its own row instead.
 * Used by: apps' rows and menu buttons. The list and the hook live in ContextMenuContent.tsx and useContextMenu.tsx and are exported from here too.
 */
import React, { useRef } from 'react';
import { useContextMenu } from './useContextMenu';
import type { ContextMenuItem } from './ContextMenuContent';

export { ContextMenuContent } from './ContextMenuContent';
export type { ContextMenuItem, ContextMenuChoice, ContextMenuChoices } from "./ContextMenuContent";
export { useContextMenu } from './useContextMenu';
export type { ContextMenuOptions, ContextMenuResult, ContextMenuTriggerProps } from './useContextMenu';

interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  className?: string;
  /** Open on click instead of right-click (useful for dropdown menus) */
  trigger?: 'click' | 'contextmenu';
  /** When true, the context menu will not open */
  disabled?: boolean;
  /** The menu's accessible name (default "Actions"). */
  label?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, children, className, trigger = 'contextmenu', disabled = false, label = 'Actions' }) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const menu = useContextMenu(() => items, { label, disabled });

  const onClick = () => {
    if (menu.isOpen) return menu.close();
    const box = wrapper.current;
    if (!box) return;
    // Escape gives the focus back to the menu button; Safari does not focus a button on click, so look for it.
    const active = document.activeElement;
    const from = active instanceof HTMLElement && box.contains(active) ? active : box.querySelector<HTMLElement>('button, a[href], [tabindex]') ?? box;
    menu.open(box, from);
  };

  return (
    <>
      <div ref={wrapper} className={className} {...(trigger === 'click' ? { onClick } : menu.triggerProps)}>
        {children}
      </div>
      {menu.menu}
    </>
  );
};

export default ContextMenu;
