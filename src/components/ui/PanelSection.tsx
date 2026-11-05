/**
 * @file PanelSection.tsx
 * @description A side-panel section under its kicker (a small caps heading), with the dashed "Add ..." chip that sits at the foot of a list in it.
 * Ported from drift@d91d6950:frontend/src/app/shell/panels/infoStyles.ts (`KICKER`) and yard@0b9f18f:frontend/src/ui/Property.tsx (`PanelSection`).
 * Used by: the apps' side panels, with PropertyRow.
 */
import type { ReactNode } from 'react';
import { cn } from '@frameer/lib/design-system';

export interface PanelSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function PanelSection({ title, children, className }: PanelSectionProps) {
  return (
    <section className={cn('flex flex-col gap-2', className)} aria-label={title}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">{title}</h3>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

export interface AddChipProps {
  /** The visible text, "Add time". */
  label: string;
  onClick: () => void;
  /** An icon node before the label (a plus by default). */
  icon?: ReactNode;
  className?: string;
}

export function AddChip({ label, onClick, icon, className }: AddChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex min-h-8 w-fit items-center gap-1.5 rounded-full border border-dashed border-[var(--line-2)] px-3 text-[13px] font-medium text-[var(--ink-2)] hover:bg-[var(--hover)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-line)]',
        className,
      )}
    >
      <span aria-hidden="true">{icon ?? '+'}</span>
      {label}
    </button>
  );
}
