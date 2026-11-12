/**
 * @file ThemeChoice.tsx
 * @description The theme override: System, Light or Dark as one Segmented radio group with a monitor, a sun and a moon (Drift line drawings). It is controlled: the app keeps the choice (its settings store) and applies it, for instance through ThemeInitializer.
 * Based on yard@36ea4be:frontend/src/shell/ThemeChoice.tsx
 * Used by: the rail's account menu, the phone's More sheet and settings pages.
 */
import React from 'react';
import { Segmented } from './Segmented';
import type { ThemeMode } from './ThemeInitializer';

export interface ThemeChoiceProps {
  value: ThemeMode;
  onChange: (theme: ThemeMode) => void;
  /** Show only the icons (the labels stay as names and tooltips). */
  iconOnly?: boolean;
  className?: string;
}

const OPTIONS = [
  { id: 'system', label: 'System', line: 'monitor' },
  { id: 'light', label: 'Light', line: 'today' },
  { id: 'dark', label: 'Dark', line: 'moon' },
] as const;

export const ThemeChoice: React.FC<ThemeChoiceProps> = ({ value, onChange, iconOnly, className }) => (
  <Segmented<ThemeMode> label="Theme" options={OPTIONS} value={value} onChange={onChange} iconOnly={iconOnly} className={className} />
);
