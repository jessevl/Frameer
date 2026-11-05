/**
 * @file ThemeChoice.tsx
 * @description The theme override: System, Light or Dark as one Segmented radio group with a monitor, a sun and a moon. It is controlled: the app keeps the choice (its settings store) and applies it, for instance through ThemeInitializer.
 * Based on yard@36ea4be:frontend/src/shell/ThemeChoice.tsx
 * Used by: the rail's account menu, the phone's More sheet and settings pages.
 */
import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
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
  { id: 'system', label: 'System', icon: <Monitor size={14} /> },
  { id: 'light', label: 'Light', icon: <Sun size={14} /> },
  { id: 'dark', label: 'Dark', icon: <Moon size={14} /> },
] as const;

export const ThemeChoice: React.FC<ThemeChoiceProps> = ({ value, onChange, iconOnly, className }) => (
  <Segmented<ThemeMode> label="Theme" options={OPTIONS} value={value} onChange={onChange} iconOnly={iconOnly} className={className} />
);
