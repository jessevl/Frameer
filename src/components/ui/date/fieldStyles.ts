/**
 * @file fieldStyles.ts
 * @description The shared look of the date and time fields: a 36 px field with 14 px text (44 px and 16 px on a phone) and the small capitals label 6 px above it.
 * Used by: DateField, TimeField, DateRangeFields, DateTimeField.
 */

export const FIELD_LABEL = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]';

export const FIELD_BOX =
  'flex h-9 min-w-0 items-center gap-2 rounded-[var(--radius-glyph)] border border-[var(--line-2)] bg-[var(--paper)] px-2.5 text-sm text-[var(--ink)] outline-none transition-colors ' +
  'hover:border-[var(--coral-line)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--line-2)] ' +
  'max-md:h-11 max-md:text-base';

export const QUICK_BUTTON =
  'h-8 rounded-[var(--radius-tree)] text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] disabled:opacity-40 max-md:h-11 max-md:text-sm';

export const FIELD_ERROR = 'mt-1 text-xs text-[var(--color-danger-fg)]';
