/**
 * @file ContextMenuContent.tsx
 * @description The list inside a context menu, in one grammar for the suite: an optional row of quick icon actions, on and off tiles, then items with an icon, a quiet heading above a group, a right-aligned shortcut hint, a check on the current choice, submenus that open in place and destructive items in the coral ink. The keyboard works as in a native menu: Arrow up and down wrap, Home and End, Right opens a submenu and Left closes it, Enter and Space choose, a typed letter jumps to the next item starting with it.
 * Based on drift@d91d6950:frontend/src/items/ui/MenuList.tsx (the grammar and the keys)
 *
 * The panel around the list carries `role="menu"`; this list only draws the items and handles keys. Items a person may
 * not use should be left out rather than disabled, so a short menu stays short.
 * Used by: ContextMenu and useContextMenu; apps that put a menu list inside their own popover.
 */
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@frameer/lib/design-system';
import { ChromeIcon } from './ChromeIcons';
import ToggleTile from './ToggleTile';
import { LineIcon, type LineName } from '@frameer/icons/LineIcon';
import { ChoiceRow, type ContextMenuChoices } from './ContextMenuChoices';

export type { ContextMenuChoice, ContextMenuChoices } from './ContextMenuChoices';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** One of the suite's line icons, drawn in the menu's icon grey. `icon` wins when both are set. */
  line?: LineName;
  /** What the item does. Not called for an item with `choices` (its options call `choices.onToggle`); pass a no-op there. */
  onClick: () => void;
  /** Draws the item as a compact choice row: the label, then round options (color swatches or avatars), single or several. */
  choices?: ContextMenuChoices;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  /** A line above this item. */
  divider?: boolean;
  /** A quiet label above this item: the start of a group of options ("Show under"). */
  heading?: string;
  /** Right-aligned quiet text in the mono face: the item's shortcut ("R", "Del"). */
  hint?: string;
  /** The older name of `hint`; `hint` wins when both are set. */
  shortcut?: string;
  /** Marks this item as one choice of a set (`menuitemradio`) and whether it is the current one; a check is drawn when true. */
  checked?: boolean;
  /** With `checked`: one of several options that can be on together (`menuitemcheckbox`) instead of one of a set. */
  checkbox?: boolean;
  /** Leave the menu open after the item ran (switching people on and off in turn). */
  keepOpen?: boolean;
  /** When set, the item is drawn as an on and off tile in a grid above the list. */
  toggled?: boolean;
  /** A submenu, opened in place under the item (by a click, Enter or Right). */
  children?: ContextMenuItem[];
  /** Drawn in the row of quick icon actions at the top (icon over a small label) instead of the list. */
  quick?: boolean;
}

interface ContextMenuContentProps {
  items: ContextMenuItem[];
  /** Called with the chosen item (never with an item that only opens a submenu). */
  onItemClick?: (item: ContextMenuItem) => void;
  className?: string;
  /** Larger, touch-friendly rows (a sheet on a phone). */
  touchFriendly?: boolean;
  /** Move the focus to the first item when the list appears, as a menu does when it opens. */
  autoFocus?: boolean;
}

const ITEM_SELECTOR = '[role="menuitem"]:not(:disabled), [role="menuitemradio"]:not(:disabled), [role="menuitemcheckbox"]:not(:disabled)';

function roleOf(item: ContextMenuItem): 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' {
  if (item.checked === undefined) return 'menuitem';
  return item.checkbox ? 'menuitemcheckbox' : 'menuitemradio';
}

/** The item's icon: its own node, else its line icon. */
function iconOf(item: ContextMenuItem): React.ReactNode {
  return item.icon ?? (item.line ? <LineIcon name={item.line} size={18} inherit /> : undefined);
}

export const ContextMenuContent: React.FC<ContextMenuContentProps> = ({ items, onItemClick, className, touchFriendly = false, autoFocus = false }) => {
  const root = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  // After a submenu opens or closes by key, the item to focus once it is drawn.
  const focusNext = useRef<string | null>(null);

  useEffect(() => {
    if (autoFocus) root.current?.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus({ preventScroll: true });
  }, [autoFocus]);

  useEffect(() => {
    const id = focusNext.current;
    if (!id) return;
    focusNext.current = null;
    const all = root.current?.querySelectorAll<HTMLElement>('[data-item-id]') ?? [];
    Array.from(all).find((el) => el.dataset.itemId === id)?.focus({ preventScroll: true });
  });

  const run = (item: ContextMenuItem) => {
    if (item.disabled) return;
    if (item.children?.length) {
      const opening = expanded !== item.id;
      setExpanded(opening ? item.id : null);
      if (opening) focusNext.current = item.children.find((c) => !c.disabled)?.id ?? null;
      return;
    }
    onItemClick?.(item);
  };

  /** A person chose an option of a choice row. A single choice closes the menu (unless `keepOpen`); several stay open. */
  const pick = (item: ContextMenuItem, optionId: string) => {
    if (item.disabled || !item.choices) return;
    item.choices.onToggle(optionId);
    onItemClick?.({ ...item, keepOpen: item.keepOpen ?? item.choices.multiple });
  };

  const byId = (id: string | undefined): ContextMenuItem | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      const child = item.children?.find((c) => c.id === id);
      if (child) return child;
    }
    return undefined;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    // A choice row is one stop for the up and down keys; its options are reached with Left and Right.
    const list = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter((el) => el.dataset.choiceRow === undefined || el.dataset.choiceStop !== undefined);
    const current = document.activeElement as HTMLElement | null;
    const choiceRow = current?.dataset.choiceRow;
    const stop = choiceRow === undefined ? current : list.find((el) => el.dataset.choiceRow === choiceRow);
    const index = stop ? list.indexOf(stop) : -1;
    const item = byId(current?.dataset.itemId);
    if (choiceRow !== undefined && current) {
      const options = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter((el) => el.dataset.choiceRow === choiceRow);
      const at = options.indexOf(current);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        options[(at + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length]?.focus({ preventScroll: true });
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        // Chosen here, like the other items, so Space acts on key down.
        e.preventDefault();
        const owner = byId(choiceRow);
        if (owner && current.dataset.choiceId !== undefined) pick(owner, current.dataset.choiceId);
        return;
      }
    }
    const focus = (i: number) => list[(i + list.length) % list.length]?.focus({ preventScroll: true });
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focus(index + 1);
        return;
      case 'ArrowUp':
        e.preventDefault();
        focus(index < 0 ? -1 : index - 1);
        return;
      case 'Home':
        e.preventDefault();
        focus(0);
        return;
      case 'End':
        e.preventDefault();
        focus(-1);
        return;
      case 'ArrowRight':
        if (item?.children?.length && expanded !== item.id) {
          e.preventDefault();
          run(item);
        }
        return;
      case 'ArrowLeft': {
        const parent = current?.dataset.parentId;
        if (parent) {
          e.preventDefault();
          setExpanded(null);
          focusNext.current = parent;
        } else if (item?.children?.length && expanded === item.id) {
          e.preventDefault();
          setExpanded(null);
        }
        return;
      }
      case 'Enter':
      case ' ':
        // Chosen here rather than by the button's own click, so Space acts on key down like Enter.
        if (item) {
          e.preventDefault();
          run(item);
        }
        return;
      default:
        if (e.key.length === 1 && e.key.trim()) {
          const letter = e.key.toLowerCase();
          const order = list.map((_, i) => list[(index + 1 + i) % list.length]).filter((el) => el?.dataset.choiceRow === undefined);
          const hit = order.find((el) => el?.textContent?.trim().toLowerCase().startsWith(letter));
          if (hit) {
            e.preventDefault();
            hit.focus({ preventScroll: true });
          }
        }
    }
  };

  const rowClass = (item: ContextMenuItem, nested: boolean) =>
    cn(
      'flex w-full items-center gap-2 rounded-[var(--radius-glyph)] text-left font-medium outline-none',
      'focus-visible:bg-[var(--hover)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] enabled:hover:bg-[var(--hover)] disabled:opacity-45',
      touchFriendly ? 'h-11 px-3 text-base' : 'h-[30px] px-2 text-[13px] pointer-coarse:h-11',
      nested && (touchFriendly ? 'pl-5' : 'pl-3'),
      item.variant === 'danger' ? 'text-[var(--coral-ink)]' : 'text-[var(--ink)]',
    );

  const row = (item: ContextMenuItem, parent?: ContextMenuItem) => {
    const hasChildren = !!item.children?.length;
    const open = expanded === item.id;
    const hint = item.hint ?? item.shortcut;
    const lead = (
      <>
        {item.divider ? <div role="separator" className={cn('mx-1.5 h-px bg-[var(--line)]', touchFriendly ? 'my-1.5' : 'my-[3px]')} /> : null}
        {item.heading ? (
          <p role="presentation" className="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
            {item.heading}
          </p>
        ) : null}
      </>
    );
    if (item.choices) {
      return (
        <React.Fragment key={item.id}>
          {lead}
          <ChoiceRow itemId={item.id} label={item.label} choices={item.choices} touchFriendly={touchFriendly} nested={!!parent} onPick={(id) => pick(item, id)} />
        </React.Fragment>
      );
    }
    return (
      <React.Fragment key={item.id}>
        {lead}
        <button
          type="button"
          role={roleOf(item)}
          aria-checked={item.checked}
          aria-haspopup={hasChildren ? 'menu' : undefined}
          aria-expanded={hasChildren ? open : undefined}
          aria-keyshortcuts={hint}
          data-item-id={item.id}
          data-parent-id={parent?.id}
          disabled={item.disabled}
          tabIndex={-1}
          onClick={() => run(item)}
          onKeyUp={(e) => e.key === ' ' && e.preventDefault()}
          className={rowClass(item, !!parent)}
        >
          <span className={cn('flex shrink-0 items-center justify-center text-[var(--ink-2)]', touchFriendly ? 'h-5 w-5' : 'h-[18px] w-[18px]')} aria-hidden="true">
            {iconOf(item)}
          </span>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.checked ? <ChromeIcon name="check" size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-[var(--coral)]" /> : null}
          {hint ? (
            <span aria-hidden="true" className="shrink-0 font-mono text-[10.5px] font-normal text-[var(--ink-2)]">
              {hint}
            </span>
          ) : null}
          {hasChildren ? (
            <ChromeIcon name="chevronRight" size={16} strokeWidth={1.8} aria-hidden="true" className={cn('shrink-0 text-[var(--ink-2)] transition-transform', open && 'rotate-90')} />
          ) : null}
        </button>
        {hasChildren && open ? (
          <div role="group" aria-label={item.label} className="ml-3 border-l border-[var(--line)]">
            {item.children?.map((child) => row(child, item))}
          </div>
        ) : null}
      </React.Fragment>
    );
  };

  const quick = items.filter((i) => i.quick);
  const tiles = items.filter((i) => i.toggled !== undefined && !i.quick);
  const rest = items.filter((i) => i.toggled === undefined && !i.quick);

  return (
    <div ref={root} role="none" onKeyDown={onKeyDown} className={cn('flex max-h-[inherit] flex-col', className)}>
      {quick.length > 0 ? (
        <div role="none" className="mb-1 grid gap-0.5 border-b border-[var(--line)] pb-1" style={{ gridTemplateColumns: `repeat(${quick.length}, minmax(0, 1fr))` }}>
          {quick.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              data-item-id={item.id}
              disabled={item.disabled}
              tabIndex={-1}
              onClick={() => run(item)}
              onKeyUp={(e) => e.key === ' ' && e.preventDefault()}
              className={cn(
                'flex flex-col items-center gap-1 rounded-[var(--radius-tree)] px-1 py-1.5 text-[10.5px] font-medium outline-none',
                'focus-visible:bg-[var(--hover)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] enabled:hover:bg-[var(--hover)] disabled:opacity-45',
                item.variant === 'danger' ? 'text-[var(--coral-ink)]' : 'text-[var(--ink)]',
              )}
            >
              {iconOf(item) ? <span aria-hidden="true" className="flex h-[18px] w-[18px] items-center justify-center text-[var(--ink-2)]">{iconOf(item)}</span> : null}
              <span className="max-w-full truncate">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
      {tiles.length > 0 ? (
        <>
          <div role="none" className={cn('grid gap-1.5 px-1 py-1', tiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
            {tiles.map((item) => (
              <ToggleTile key={item.id} role="menuitemcheckbox" active={!!item.toggled} onClick={() => run(item)} label={item.label} icon={iconOf(item)} disabled={item.disabled} />
            ))}
          </div>
          {rest.length > 0 ? <div role="separator" className="mx-1.5 my-[3px] h-px bg-[var(--line)]" /> : null}
        </>
      ) : null}
      {rest.map((item) => row(item))}
    </div>
  );
};
