'use client';

/**
 * @file ChromeIcons.tsx
 * @description Icon provider for Frameer's own chrome (chevrons, close buttons, toast and banner glyphs, the icon picker grid, the empty states and `common/Icons`). Frameer draws Lucide by default; an app wraps its tree in `ChromeIconsProvider` to swap any named icon for its own drawing (its animated rendering included) and to give every remaining Lucide icon a house style (class and stroke width), so chrome and the app's toolbars never mix two icon families. Every icon `ChromeIcon` draws carries `data-chrome="<name>"`; hover motion is the app's CSS on that attribute, triggered from the host button the way the app's own buttons do it.
 * @app SHARED - Generic: knows nothing about any app's icon set.
 */
import React, { createContext, useContext, useMemo } from 'react';
import {
  AlertCircle, AlertTriangle, Bug, CalendarDays, CalendarRange, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight,
  FileText, Folder, Home, Inbox, Info, Layers, ListTodo, Loader2, Pencil, Plus, RefreshCw, Search, SearchX, Sparkles, StickyNote,
  Undo2, WifiOff, X,
  AlignCenter, AlignLeft, AlignRight, ArrowLeft, ArrowRight, ArrowUpDown, Bold, Bookmark, Clock, Code, Columns2, Columns3, Download, Ellipsis, ExternalLink, Filter, Flag, Hash, Highlighter, Image, Italic, LayoutGrid, Lightbulb, Link, List, ListTree, Menu, Mic, Minus, Paperclip, Pause, Pin, Play, Quote, Repeat, Settings, Strikethrough, Table, Table2, Timer, Trash2, Type, Underline, Upload, User, Video,
} from 'lucide-react';

/** The props every chrome icon accepts; a Lucide component satisfies them. */
export interface ChromeIconProps {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  /** Set by `ChromeIcon` to the icon's name, so an app's CSS can give each its hover gesture from the host button. */
  'data-chrome'?: ChromeIconName;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export type ChromeIconComponent = React.ComponentType<ChromeIconProps>;

const DEFAULTS = {
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  bug: Bug,
  calendarDays: CalendarDays,
  calendarRange: CalendarRange,
  check: Check,
  checkCircle: CheckCircle,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  close: X,
  fileText: FileText,
  folder: Folder,
  home: Home,
  inbox: Inbox,
  info: Info,
  layers: Layers,
  listTodo: ListTodo,
  loader: Loader2,
  pencil: Pencil,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  searchEmpty: SearchX,
  sparkles: Sparkles,
  stickyNote: StickyNote,
  undo: Undo2,
  wifiOff: WifiOff,
  alignCenter: AlignCenter,
  alignLeft: AlignLeft,
  alignRight: AlignRight,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  bold: Bold,
  bookmark: Bookmark,
  clock: Clock,
  code: Code,
  download: Download,
  externalLink: ExternalLink,
  filter: Filter,
  flag: Flag,
  hash: Hash,
  highlighter: Highlighter,
  image: Image,
  italic: Italic,
  kanbanView: Columns3,
  lightbulb: Lightbulb,
  link: Link,
  listView: List,
  menu: Menu,
  mic: Mic,
  minus: Minus,
  more: Ellipsis,
  paperclip: Paperclip,
  pause: Pause,
  pin: Pin,
  play: Play,
  quote: Quote,
  repeat: Repeat,
  settings: Settings,
  sort: ArrowUpDown,
  splitView: Columns2,
  strikethrough: Strikethrough,
  table: Table2,
  tableOfContents: ListTree,
  tableView: Table,
  timer: Timer,
  trash: Trash2,
  type: Type,
  underline: Underline,
  upload: Upload,
  user: User,
  video: Video,
  viewSwitcher: LayoutGrid,
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
    return <Custom className={className} strokeWidth={strokeWidth} data-chrome={name} {...rest} />;
  }
  const Default = DEFAULTS[name];
  return <Default className={chromeClass(style ?? {}, className)} strokeWidth={style?.strokeWidth ?? strokeWidth} data-chrome={name} {...rest} />;
};
