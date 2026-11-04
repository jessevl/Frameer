/**
 * @file useContextMenu.tsx
 * @description Gives any row or card a context menu that opens every way a person might try: a right click, a 500 ms long press on touch (the click after it is swallowed), the Menu key and Shift+F10, and `open(anchor)` for a `…` button. The menu opens at the pointer or under the element, as a sheet on a phone; the focus moves to its first item, and Escape closes it and returns the focus to where the menu was opened.
 * Based on drift@d91d6950:frontend/src/items/ui/useItemMenuHandlers.ts (right click and long press)
 *
 * The items are a function, read on every render while the menu is open, so a checked mark follows the app's state when
 * an item keeps the menu open. A menu with no items does not open (and a right click then shows the browser's menu).
 * Text fields and editable areas keep the browser's own menu.
 * Used by: ContextMenu; apps' rows, cards and calendar blocks.
 */
import React, { useCallback, useRef, useState } from 'react';
import { useLongPress } from '@frameer/hooks/useLongPress';
import { ContextMenuContent, type ContextMenuItem } from './ContextMenuContent';
import { FloatingSurface, usePhoneWidth, type FloatingAnchor } from './FloatingSurface';

export interface ContextMenuOptions {
  /** The menu's accessible name ("Actions for Dinner with Sam"); "Actions" when left out. */
  label: string;
  /** Opens nothing while true. */
  disabled?: boolean;
}

export interface ContextMenuTriggerProps {
  onContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  onTouchStart: (event: React.TouchEvent<HTMLElement>) => void;
  onTouchMove: (event: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd: (event: React.TouchEvent<HTMLElement>) => void;
  onTouchCancel: () => void;
  onClickCapture: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface ContextMenuResult {
  /** Spread on the row. A row with its own `onKeyDown` calls this one from it. */
  triggerProps: ContextMenuTriggerProps;
  /** Opens the menu under an element (a `…` button) or at a point. Returns false when there are no items. */
  open: (anchor: FloatingAnchor, returnFocus?: HTMLElement | null) => boolean;
  close: () => void;
  /** True while the menu is open: the row draws its ring. */
  isOpen: boolean;
  /** The menu itself (portalled); render it anywhere in the component. */
  menu: React.ReactNode;
}

const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

function editable(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(EDITABLE);
}

function isMenuKey(event: React.KeyboardEvent): boolean {
  return event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');
}

export function useContextMenu(items: () => ContextMenuItem[], options?: ContextMenuOptions): ContextMenuResult {
  const label = options?.label ?? 'Actions';
  const disabled = options?.disabled ?? false;
  const phone = usePhoneWidth();
  const [state, setState] = useState<{ anchor: FloatingAnchor; returnFocus: HTMLElement | null } | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const touch = useRef<{ point: { x: number; y: number }; target: HTMLElement | null }>({ point: { x: 0, y: 0 }, target: null });

  const open = useCallback(
    (anchor: FloatingAnchor, returnFocus?: HTMLElement | null) => {
      if (disabled || itemsRef.current().length === 0) return false;
      const back = returnFocus !== undefined ? returnFocus : anchor instanceof HTMLElement ? anchor : null;
      setState({ anchor, returnFocus: back });
      return true;
    },
    [disabled],
  );
  const close = useCallback(() => setState(null), []);

  const press = useLongPress({
    onLongPress: () => {
      open(touch.current.point, touch.current.target);
    },
    enabled: !disabled,
  });

  const triggerProps: ContextMenuTriggerProps = {
    onContextMenu: (event) => {
      if (editable(event.target)) return;
      if (!open({ x: event.clientX, y: event.clientY }, event.currentTarget)) return;
      event.preventDefault();
      event.stopPropagation();
    },
    onKeyDown: (event) => {
      if (!isMenuKey(event) || editable(event.target)) return;
      const from = event.target instanceof HTMLElement ? event.target : event.currentTarget;
      if (!open(event.currentTarget, from)) return;
      event.preventDefault();
      event.stopPropagation();
    },
    onTouchStart: (event) => {
      if (editable(event.target)) return;
      const t = event.touches[0];
      if (t) touch.current = { point: { x: t.clientX, y: t.clientY }, target: event.currentTarget };
      press.longPressHandlers.onTouchStart(event);
    },
    onTouchMove: press.longPressHandlers.onTouchMove,
    onTouchEnd: press.longPressHandlers.onTouchEnd,
    onTouchCancel: press.longPressHandlers.onTouchCancel,
    onClickCapture: (event) => {
      // The click that follows the lift of a long press would open the row under the finger.
      if (press.consumeLongPress()) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
  };

  const choose = (item: ContextMenuItem) => {
    if (!item.keepOpen) {
      const back = state?.returnFocus;
      setState(null);
      back?.focus({ preventScroll: true });
    }
    // Run after the focus came back, so an action that opens a dialog keeps the focus it moves there.
    item.onClick();
  };

  const menu = state ? (
    <FloatingSurface anchor={state.anchor} label={label} role="menu" onClose={close} returnFocus={state.returnFocus} className="min-w-[200px] max-w-[320px] p-1">
      <ContextMenuContent items={items()} onItemClick={choose} touchFriendly={phone} autoFocus />
    </FloatingSurface>
  ) : null;

  return { triggerProps, open, close, isOpen: state !== null, menu };
}
