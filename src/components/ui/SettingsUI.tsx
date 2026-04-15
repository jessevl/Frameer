/**
 * Settings UI - Shared primitives for settings panels
 * Toggle switches, sliders, segmented controls, cards, collapsibles, etc.
 *
 * These are compact, settings-specific components distinct from the general UI library.
 * They use CSS custom properties for theming (var(--color-*)).
 */

import React, { useState } from 'react';
import { cn } from '@frameer/lib/design-system';
import { Loader2, Check, AlertCircle, ChevronDown } from 'lucide-react';

export const sliderClass = [
  'settings-slider h-2 w-full cursor-pointer appearance-none rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-tertiary)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-base)]',
  '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:border-none [&::-webkit-slider-runnable-track]:bg-transparent',
  '[&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:w-4.5',
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--color-surface-base)] [&::-webkit-slider-thumb]:bg-[var(--color-control-checked-bg)]',
  '[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer',
  '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border-none [&::-moz-range-track]:bg-transparent',
  '[&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2',
  '[&::-moz-range-thumb]:border-[var(--color-surface-base)] [&::-moz-range-thumb]:bg-[var(--color-control-checked-bg)]',
].join(' ');

export const settingsInputClass = cn(
  'w-full px-3 py-1.5 rounded-lg border text-sm',
  'bg-[var(--color-surface-inset)] border-[var(--color-border-default)]',
  'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-fg)] focus:border-transparent',
);

export const SettingsToggle: React.FC<{
  enabled: boolean;
  onChange: (v: boolean) => void;
}> = ({ enabled, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    data-state={enabled ? 'checked' : 'unchecked'}
    onClick={() => onChange(!enabled)}
    className={cn(
      'settings-toggle relative h-[22px] w-10 rounded-full border transition-all duration-200 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-base)]',
      enabled
        ? 'border-[var(--color-control-checked-border)] bg-[var(--color-control-checked-bg)]'
        : 'border-[var(--color-control-unchecked-border)] bg-[var(--color-control-unchecked-bg)]',
    )}
  >
    <span
      className={cn(
        'settings-toggle-thumb absolute top-[3px] h-4 w-4 rounded-full border transition-transform duration-200',
        enabled
          ? 'bg-[var(--color-control-checked-fg)]'
          : 'bg-[var(--color-text-primary)]',
        enabled
          ? 'border-[var(--color-control-checked-fg)]'
          : 'border-[var(--color-control-unchecked-border)]',
        enabled ? 'left-[22px]' : 'left-[3px]',
      )}
    />
  </button>
);

export const SettingsToggleRow: React.FC<{
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-1.5">
    <div className="min-w-0">
      <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
      {description && (
        <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{description}</p>
      )}
    </div>
    <SettingsToggle enabled={enabled} onChange={onChange} />
  </div>
);

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented-control settings-segmented-control inline-flex gap-0.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          data-selected={value === opt.value}
          data-state={value === opt.value ? 'checked' : 'unchecked'}
          className={cn(
            'segmented-control-option settings-segmented-control-option rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium transition-all',
            value === opt.value
              ? 'bg-[var(--color-surface-base)] text-[var(--color-text-primary)] border-[var(--color-border-default)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export const SliderRow: React.FC<{
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (v: number) => string;
  onChange: (v: number) => void;
}> = ({ label, description, value, min, max, step = 1, unit = '', formatValue, onChange }) => (
  <div className="py-1.5">
    <div className="mb-1.5 flex items-center justify-between">
      <div className="min-w-0">
        <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{description}</p>
        )}
      </div>
      <span className="ml-3 flex-shrink-0 text-xs font-mono text-[var(--color-text-tertiary)]">
        {formatValue ? formatValue(value) : `${value}${unit}`}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className={sliderClass}
    />
  </div>
);

export const SettingsSectionHeader: React.FC<{
  title: string;
  description?: string;
}> = ({ title, description }) => (
  <div className="pt-1 pb-0.5">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
      {title}
    </h4>
    {description && (
      <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{description}</p>
    )}
  </div>
);

export const SettingsSeparator: React.FC = () => (
  <div className="my-1 border-t border-[var(--color-border-subtle)]" />
);

export const SettingsCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('rounded-xl bg-[var(--color-surface-secondary)] p-3', className)}>
    {children}
  </div>
);

export const SettingsStatusMessage: React.FC<{
  type: 'error' | 'success';
  message: string;
}> = ({ type, message }) => (
  <div
    className={cn(
      'flex items-center gap-2 rounded-lg p-2.5 text-sm',
      type === 'error'
        ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
        : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    )}
  >
    {type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
    {message}
  </div>
);

export const SettingsCollapsible: React.FC<{
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, description, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-hover)]"
      >
        <div>
          <span className="text-sm font-medium text-[var(--color-text-primary)]">{title}</span>
          {description && (
            <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{description}</p>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            'text-[var(--color-text-tertiary)] transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-[var(--color-border-subtle)] px-3 pt-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
};

export const SettingsSaveButton: React.FC<{
  saving: boolean;
  success: boolean;
  onClick: () => void;
  label?: string;
}> = ({ saving, success, onClick, label = 'Save' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={saving}
    className={cn(
      'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all',
      'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)]',
      'disabled:cursor-not-allowed disabled:opacity-50',
    )}
  >
    {saving ? <Loader2 size={14} className="animate-spin" /> : success ? <Check size={14} /> : null}
    {saving ? 'Saving…' : success ? 'Saved!' : label}
  </button>
);

export const SettingsActionButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon: React.ReactNode;
  loadingIcon?: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger';
  className?: string;
}> = ({ onClick, disabled, loading, icon, loadingIcon, label, variant = 'default', className }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      variant === 'danger'
        ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400'
        : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
  >
    {loading ? (loadingIcon || <Loader2 size={14} className="animate-spin" />) : icon}
    {label}
  </button>
);

export const SettingsNumberInput: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  className?: string;
}> = ({ value, min, max, onChange, className }) => (
  <input
    type="number"
    min={min}
    max={max}
    value={value}
    onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value, 10) || min)))}
    className={cn(
      'w-16 rounded-md border px-2 py-1 text-right text-sm',
      'bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] border-[var(--color-border-default)]',
      className,
    )}
  />
);

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}