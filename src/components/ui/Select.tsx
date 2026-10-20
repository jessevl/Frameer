/**
 * @file Select.tsx
 * @description A themed select that replaces the native `<select>`: a button trigger with a chevron and a listbox menu (a bottom sheet on phones) with arrows, Home/End, type-ahead, Escape, groups, a check on the selected option and an optional leading swatch or icon. Options come from the `options` prop or from `<Select.Option>` / `<Select.Group>` children, so a call site reads like the native element it replaced.
 * Why: native selects cannot be themed, have no swatches and open an OS popup on phones. The menu is portalled and marked `data-floating-panel` so a panel that hosts the select does not treat a click in the menu as a click outside; Escape closes only the menu.
 * Used by: every form, panel and toolbar that picks one value from a list.
 */
import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@frameer/lib/design-system';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  /** CSS color for a leading dot. */
  swatch?: string;
  disabled?: boolean;
}

interface SelectGroupData {
  label: string;
  options: SelectOption[];
}

interface SelectProps {
  /** Compared as a string, like the value of a native select. */
  value: string | number;
  onChange: (value: string) => void;
  /** Options as data; use children instead for groups. */
  options?: SelectOption[];
  /** `<Select.Option>` and `<Select.Group>` elements. */
  children?: React.ReactNode;
  placeholder?: string;
  /** Classes for the trigger. When given they replace the default look, as a class on a native select did. */
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'minimal';
  /** Stretch the trigger to its container. */
  fullWidth?: boolean;
  disabled?: boolean;
  id?: string;
  title?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
}

interface OptionProps {
  value: string | number;
  disabled?: boolean;
  icon?: React.ReactNode;
  swatch?: string;
  children?: React.ReactNode;
}

interface GroupProps {
  label: string;
  children?: React.ReactNode;
}

const Option: React.FC<OptionProps> = () => null;
const Group: React.FC<GroupProps> = () => null;

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

function collect(children: React.ReactNode, flat: SelectOption[], groups: SelectGroupData[], group: SelectGroupData | null): void {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      collect((child.props as { children?: React.ReactNode }).children, flat, groups, group);
    } else if (child.type === Option) {
      const p = child.props as OptionProps;
      const option: SelectOption = { value: String(p.value), label: textOf(p.children), icon: p.icon, swatch: p.swatch, disabled: p.disabled };
      flat.push(option);
      (group ?? groups[groups.length - 1] ?? pushGroup(groups, '')).options.push(option);
    } else if (child.type === Group) {
      const p = child.props as GroupProps;
      const next = pushGroup(groups, p.label);
      collect(p.children, flat, groups, next);
    }
  });
}

function pushGroup(groups: SelectGroupData[], label: string): SelectGroupData {
  const g = { label, options: [] };
  groups.push(g);
  return g;
}

const SIZE_CLASSES = { sm: 'min-h-7 px-2 text-xs', md: 'min-h-8 px-3 text-sm', lg: 'min-h-10 px-4 text-base' };
const VARIANT_CLASSES = {
  default: 'bg-[var(--paper)] border border-[var(--line-2)] hover:border-[var(--coral-line)]',
  ghost: 'bg-transparent border border-transparent hover:bg-[var(--hover)] hover:border-[var(--line-2)]',
  minimal: 'bg-transparent border border-transparent hover:bg-[var(--hover)]',
};

const Chevron: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[var(--ink-3)]">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CheckMark: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[var(--coral-ink)]">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Lead: React.FC<{ option: SelectOption }> = ({ option }) =>
  option.swatch ? (
    <span aria-hidden="true" className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--line-2)]" style={{ background: option.swatch }} />
  ) : option.icon ? (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center text-[var(--ink-2)]">{option.icon}</span>
  ) : null;

const PHONE_QUERY = '(max-width: 767px)';

/** Own media-query read: the menu becomes a sheet below the md breakpoint whatever the device. */
function usePhoneWidth(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia?.(PHONE_QUERY);
      mq?.addEventListener?.('change', notify);
      return () => mq?.removeEventListener?.('change', notify);
    },
    () => window.matchMedia?.(PHONE_QUERY)?.matches ?? false,
    () => false,
  );
}

const MENU_MAX = 320;
const MARGIN = 8;
const TYPE_AHEAD_MS = 700;

const SelectRoot: React.FC<SelectProps> = ({
  value: rawValue, onChange, options, children, placeholder = 'Select...', className, size = 'md', variant = 'default',
  fullWidth = false, disabled = false, id, title, ...aria
}) => {
  const value = String(rawValue);
  const uid = useId();
  const listId = `${uid}-list`;
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null);
  const phone = usePhoneWidth();

  const { flat, groups } = useMemo(() => {
    const f: SelectOption[] = [];
    const g: SelectGroupData[] = [];
    if (options) {
      f.push(...options);
      g.push({ label: '', options: [...options] });
    }
    collect(children, f, g, null);
    return { flat: f, groups: g.filter((x) => x.options.length > 0) };
  }, [options, children]);

  const selected = flat.find((o) => o.value === value);
  const indexOf = (o: SelectOption) => flat.indexOf(o);

  const close = useCallback(() => setOpen(false), []);
  const openMenu = () => {
    if (disabled) return;
    const at = flat.findIndex((o) => o.value === value && !o.disabled);
    setActive(at >= 0 ? at : flat.findIndex((o) => !o.disabled));
    setOpen(true);
  };
  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
    if (option.value !== value) onChange(option.value);
  };

  // Place the menu under the trigger, or above it when there is no room below.
  useLayoutEffect(() => {
    if (!open || phone || !trigger.current) return;
    const place = () => {
      const t = trigger.current;
      if (!t) return;
      const r = t.getBoundingClientRect();
      const height = menu.current?.offsetHeight ?? MENU_MAX;
      const below = window.innerHeight - r.bottom - MARGIN;
      const above = r.top - MARGIN;
      const up = height > below && above > below;
      const maxHeight = Math.min(MENU_MAX, up ? above : below);
      const width = Math.max(r.width, 160);
      const left = Math.max(MARGIN, Math.min(r.left, window.innerWidth - width - MARGIN));
      setPos({ left, top: up ? Math.max(MARGIN, r.top - Math.min(height, maxHeight) - 4) : r.bottom + 4, width, maxHeight });
    };
    place();
    const onScroll = (e: Event) => {
      if (!menu.current?.contains(e.target as Node)) place();
    };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, phone, flat.length]);

  // Outside presses close the menu; Escape closes only the menu, not the panel or dialog that hosts the select.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menu.current?.contains(target) && !trigger.current?.contains(target)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      e.stopImmediatePropagation();
      close();
      trigger.current?.focus({ preventScroll: true });
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open, close]);

  useEffect(() => {
    if (open && active >= 0) menu.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, active, pos]);

  const step = (from: number, dir: 1 | -1): number => {
    for (let i = from + dir; i >= 0 && i < flat.length; i += dir) if (!flat[i]?.disabled) return i;
    return from;
  };

  const typeAhead = (char: string, from: number): number => {
    const now = Date.now();
    const t = typed.current;
    t.text = now - t.at > TYPE_AHEAD_MS ? char : t.text + char;
    t.at = now;
    const needle = t.text.toLowerCase();
    const same = t.text.length > 1 && [...t.text].every((c) => c === t.text[0]);
    const start = same ? from + 1 : Math.max(from, 0);
    const order = [...flat.keys()].map((_, i) => (start + i) % flat.length);
    const prefix = same ? (t.text[0] ?? '').toLowerCase() : needle;
    const hit = order.find((i) => !flat[i]?.disabled && flat[i]?.label.toLowerCase().startsWith(prefix));
    return hit ?? from;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || e.altKey || e.ctrlKey || e.metaKey) return;
    const printable = e.key.length === 1 && e.key !== ' ';
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu();
      } else if (printable) {
        const from = flat.findIndex((o) => o.value === value);
        const hit = typeAhead(e.key, from);
        const next = flat[hit];
        if (next && hit !== from) onChange(next.value);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActive((a) => step(a, 1)); break;
      case 'ArrowUp': e.preventDefault(); setActive((a) => step(a, -1)); break;
      case 'Home': e.preventDefault(); setActive(step(-1, 1)); break;
      case 'End': e.preventDefault(); setActive(step(flat.length, -1)); break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        {
          const option = flat[active];
          if (option) choose(option);
        }
        break;
      case 'Tab': close(); break;
      default:
        if (printable) {
          e.preventDefault();
          setActive((a) => typeAhead(e.key, a));
        }
    }
  };

  const triggerClass = className
    ? cn('inline-flex items-center justify-between gap-1.5 text-left', fullWidth && 'w-full', className)
    : cn(
        'inline-flex max-w-full items-center justify-between gap-2 rounded-[var(--radius-glyph)] text-left font-medium text-[var(--ink)] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] disabled:cursor-not-allowed disabled:opacity-50',
        SIZE_CLASSES[size], VARIANT_CLASSES[variant], fullWidth && 'w-full',
      );

  const list = (
    <div
      ref={menu}
      id={listId}
      role="listbox"
      aria-label={aria['aria-label']}
      onMouseDown={(e) => e.preventDefault()}
      className="overflow-y-auto overscroll-contain p-1"
      style={phone ? { maxHeight: '60vh' } : { maxHeight: pos?.maxHeight ?? MENU_MAX }}
    >
      {groups.map((g, gi) => (
        <div key={`${g.label}-${gi}`} role={g.label ? 'group' : 'presentation'} aria-label={g.label || undefined}>
          {g.label && <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">{g.label}</div>}
          {g.options.map((o) => {
            const i = indexOf(o);
            const isSel = o.value === value;
            return (
              <div
                key={`${o.value}-${i}`}
                id={`${uid}-o${i}`}
                data-index={i}
                data-value={o.value}
                role="option"
                aria-selected={isSel}
                aria-disabled={o.disabled || undefined}
                onMouseMove={() => !o.disabled && active !== i && setActive(i)}
                onClick={() => choose(o)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-[var(--radius-tree)] px-2.5 py-1.5 text-sm text-[var(--ink)]',
                  phone && 'py-2.5',
                  active === i && 'bg-[var(--hover)]',
                  isSel && 'font-semibold',
                  o.disabled && 'cursor-not-allowed opacity-45',
                )}
              >
                <Lead option={o} />
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {isSel && <CheckMark />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        id={id}
        title={title}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${uid}-o${active}` : undefined}
        aria-label={aria['aria-label']}
        aria-labelledby={aria['aria-labelledby']}
        aria-describedby={aria['aria-describedby']}
        data-testid={aria['data-testid']}
        data-value={value}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        className={triggerClass}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected && <Lead option={selected} />}
          <span className={cn('truncate', !selected && 'text-[var(--ink-3)]')}>{selected ? selected.label : placeholder}</span>
        </span>
        <Chevron />
      </button>
      {open && !phone && createPortal(
        <div
          data-floating-panel
          className="z-[400] overflow-hidden rounded-[var(--radius-thumb)] border border-[var(--line-2)] bg-[var(--paper)] text-[var(--ink)] shadow-[var(--shadow-float)]"
          style={{ position: 'fixed', left: pos?.left ?? 0, top: pos?.top ?? 0, minWidth: pos?.width, maxWidth: 'min(420px, calc(100vw - 16px))', visibility: pos ? 'visible' : 'hidden' }}
        >
          {list}
        </div>,
        document.body,
      )}
      {open && phone && createPortal(
        <div data-floating-panel className="fixed inset-0 z-[400]">
          <div className="absolute inset-0 bg-black/30" onMouseDown={(e) => e.preventDefault()} onClick={close} aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[var(--radius-card)] border-t border-[var(--line-2)] bg-[var(--paper)] pb-[env(safe-area-inset-bottom)] text-[var(--ink)] shadow-[var(--shadow-float)]">
            <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-[var(--line-2)]" aria-hidden="true" />
            {list}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

type SelectComponent = React.FC<SelectProps> & { Option: typeof Option; Group: typeof Group };
const Select = SelectRoot as SelectComponent;
Select.Option = Option;
Select.Group = Group;

export default Select;
