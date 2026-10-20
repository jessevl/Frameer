'use client';

/**
 * @file ChromeIcons.tsx
 * @description Icon provider for Frameer's own chrome (chevrons, close buttons, toast and banner glyphs, the icon picker grid). Frameer draws Lucide by default; an app wraps its tree in `ChromeIconsProvider` to swap any named icon for its own drawing and to give every remaining Lucide icon a house style (class and stroke width), so chrome and the app's toolbars never mix two icon families.
 * @app SHARED - Generic: knows nothing about any app's icon set.
 */
import React, { createContext, useContext, useMemo } from 'react';
import {
  AlertCircle, AlertTriangle, Bug, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight,
  Home, Info, Loader2, Plus, RefreshCw, Search, SearchX, Undo2, WifiOff, X,
} from 'lucide-react';

/** The props every chrome icon accepts; a Lucide component satisfies them. */
export interface ChromeIconProps {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export type ChromeIconComponent = React.ComponentType<ChromeIconProps>;

const DEFAULTS = {
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  bug: Bug,
  check: Check,
  checkCircle: CheckCircle,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  close: X,
  home: Home,
  info: Info,
  loader: Loader2,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  searchEmpty: SearchX,
  undo: Undo2,
  wifiOff: WifiOff,
} satisfies Record<string, ChromeIconComponent>;

export type ChromeIconName = keyof typeof DEFAULTS;

/** Class and stroke width applied to icons that stay Lucide (named defaults and the picker grid). */
export interface ChromeIconStyle {
  className?: string;
  strokeWidth?: number;
}

export interface ChromeIconsConfig {
  /** Replacements by name; they draw themselves in the app's style. */
  icons?: Partial<Record<ChromeIconName, ChromeIconComponent>>;
  /** House style for every icon Frameer still takes from Lucide. */
  style?: ChromeIconStyle;
}

const ChromeIconsContext = createContext<ChromeIconsConfig>({});

export const ChromeIconsProvider: React.FC<ChromeIconsConfig & { children: React.ReactNode }> = ({ icons, style, children }) => {
  const value = useMemo(() => ({ icons, style }), [icons, style]);
  return <ChromeIconsContext.Provider value={value}>{children}</ChromeIconsContext.Provider>;
};

/** The house style for Lucide icons Frameer draws by name (empty without a provider). */
export function useChromeIconStyle(): ChromeIconStyle {
  return useContext(ChromeIconsContext).style ?? {};
}

/** Merges the provider's class into a caller's class. */
export function chromeClass(style: ChromeIconStyle, className?: string): string | undefined {
  return [style.className, className].filter(Boolean).join(' ') || undefined;
}

/** Draws one named chrome icon: the app's replacement when the provider has one, else Lucide in the provider's style. */
export const ChromeIcon: React.FC<ChromeIconProps & { name: ChromeIconName }> = ({ name, className, strokeWidth, ...rest }) => {
  const { icons, style } = useContext(ChromeIconsContext);
  const override = icons?.[name];
  if (override) {
    const Custom = override;
    return <Custom className={className} strokeWidth={strokeWidth} {...rest} />;
  }
  const Default = DEFAULTS[name];
  return <Default className={chromeClass(style ?? {}, className)} strokeWidth={style?.strokeWidth ?? strokeWidth} {...rest} />;
};
