'use client';

/**
 * @file ChromeIcons.tsx
 * @description Icon provider for Frameer's own chrome (chevrons, close buttons, toast and banner glyphs, the empty states and `common/Icons`). Every chrome icon is a Drift line drawing (`LineIcon`, taking the text color of its button, with its parts' hover gesture from styles/motion.css); an app wraps its tree in `ChromeIconsProvider` to swap any named icon for its own drawing. Lucide is drawn only by a runtime name (a user's custom icon, the icon picker grid); the provider's `style` is the house style for those. Every icon `ChromeIcon` draws carries `data-chrome="<name>"`.
 * @app SHARED - Generic: knows nothing about any app's icon set.
 */
import React, { createContext, useContext, useMemo } from 'react';
import { LineIcon } from '../../icons/LineIcon';
import type { BaseLineName } from '../../icons/line';

/** The props every chrome icon accepts; a Lucide component satisfies them. */
export interface ChromeIconProps extends Pick<React.SVGAttributes<SVGSVGElement>, 'role' | 'aria-label' | 'aria-labelledby' | 'focusable'> {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  /** Set by `ChromeIcon` to the icon's name, so an app's CSS can give each its hover gesture from the host button. */
  'data-chrome'?: ChromeIconName;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export type ChromeIconComponent = React.ComponentType<ChromeIconProps>;

/** The Drift line drawing of each chrome icon. */
const DEFAULTS = {
  alertCircle: 'alert',
  alertTriangle: 'warning',
  bug: 'bug',
  calendarDays: 'upcoming',
  calendarRange: 'calendarrange',
  check: 'check',
  checkCircle: 'checkcircle',
  chevronDown: 'chevrondown',
  chevronLeft: 'chevronleft',
  chevronRight: 'chevronright',
  clearFormatting: 'clearformat',
  close: 'close',
  copy: 'clipboard',
  heading: 'heading',
  indentLess: 'outdent',
  indentMore: 'indent',
  logOut: 'logout',
  numberedList: 'numbered',
  panelRight: 'panel',
  redo: 'redo',
  fileText: 'pages',
  folder: 'folder',
  home: 'home',
  inbox: 'inbox',
  info: 'info',
  layers: 'alltasks',
  listTodo: 'listtodo',
  loader: 'loader',
  pencil: 'rename',
  plus: 'plus',
  refresh: 'refresh',
  search: 'search',
  searchEmpty: 'searchx',
  sparkles: 'memories',
  stickyNote: 'note',
  undo: 'undo',
  wifiOff: 'wifioff',
  alignCenter: 'aligncenter',
  alignLeft: 'alignleft',
  alignRight: 'alignright',
  arrowLeft: 'arrowleft',
  arrowRight: 'arrowright',
  bold: 'bold',
  bookmark: 'bookmark',
  clock: 'recent',
  code: 'code',
  download: 'download',
  externalLink: 'share',
  filter: 'filter',
  flag: 'flag',
  hash: 'hash',
  highlighter: 'highlight',
  image: 'cover',
  italic: 'italic',
  kanbanView: 'board',
  lightbulb: 'idea',
  link: 'copylink',
  listView: 'list',
  menu: 'menu',
  mic: 'mic',
  minus: 'minus',
  more: 'more',
  paperclip: 'attach',
  pause: 'pause',
  pin: 'pin',
  play: 'play',
  quote: 'quote',
  repeat: 'repeat',
  settings: 'settings',
  sort: 'sort',
  splitView: 'columns',
  strikethrough: 'strike',
  table: 'table',
  tableOfContents: 'toc',
  tableView: 'table',
  timer: 'timer',
  trash: 'trash',
  type: 'text',
  underline: 'underline',
  upload: 'upload',
  user: 'user',
  video: 'videos',
  viewSwitcher: 'allboards',
  // The plain icons of common/Icons.
  sidebar: 'panel',
  allTasks: 'alltasks',
  today: 'upcoming',
  upcoming: 'recent',
  completed: 'checkcircle',
  collection: 'duplicates',
  viewOptions: 'sliders',
  layout: 'layout',
  cardView: 'allboards',
  skip: 'skip',
  chart: 'chartcolumn',
  listChecks: 'listchecks',
  whiteboard: 'whiteboards',
  textFormat: 'text',
  readingPane: 'columns3',
  readingPaneOff: 'columns',
} satisfies Record<string, BaseLineName>;

export type ChromeIconName = keyof typeof DEFAULTS;

/** Class and stroke width for the icons Frameer still draws from Lucide: only an icon drawn by a runtime name (a user's custom icon, the icon picker grid). */
export interface ChromeIconStyle {
  className?: string;
  strokeWidth?: number;
}

export interface ChromeIconsConfig {
  /** Replacements by name; they draw themselves in the app's style. */
  icons?: Partial<Record<ChromeIconName, ChromeIconComponent>>;
  /** House style for the Lucide icons of the custom-icon path (LucideIcon, the icon picker). */
  style?: ChromeIconStyle;
}

const ChromeIconsContext = createContext<ChromeIconsConfig>({});

export const ChromeIconsProvider: React.FC<ChromeIconsConfig & { children: React.ReactNode }> = ({ icons, style, children }) => {
  const value = useMemo(() => ({ icons, style }), [icons, style]);
  return <ChromeIconsContext.Provider value={value}>{children}</ChromeIconsContext.Provider>;
};

/** The house style for the Lucide icons Frameer draws by runtime name (empty without a provider). */
export function useChromeIconStyle(): ChromeIconStyle {
  return useContext(ChromeIconsContext).style ?? {};
}

/** Merges the provider's class into a caller's class. */
export function chromeClass(style: ChromeIconStyle, className?: string): string | undefined {
  return [style.className, className].filter(Boolean).join(' ') || undefined;
}

/** The line drawing of a chrome icon. */
export const chromeLineName = (name: ChromeIconName): BaseLineName => DEFAULTS[name];

/** A chrome icon component that draws one Drift line drawing: it takes the chrome props (`className`, `size`, the aria props; `strokeWidth` is the set's own). */
export function lineChrome(line: BaseLineName): ChromeIconComponent {
  const Line: ChromeIconComponent = ({ className, size, strokeWidth: _strokeWidth, style, ...rest }) => (
    <LineIcon {...rest} name={line} size={typeof size === 'number' ? size : 24} className={className} style={style} inherit />
  );
  return Line;
}

const LINES = Object.fromEntries(Object.entries(DEFAULTS).map(([name, line]) => [name, lineChrome(line)])) as Record<ChromeIconName, ChromeIconComponent>;

/** Draws one named chrome icon: the app's replacement when the provider has one, else its Drift line drawing. */
export const ChromeIcon: React.FC<ChromeIconProps & { name: ChromeIconName }> = ({ name, className, strokeWidth, ...rest }) => {
  const { icons } = useContext(ChromeIconsContext);
  const Icon = icons?.[name] ?? LINES[name];
  return <Icon className={className} strokeWidth={strokeWidth} data-chrome={name} {...rest} />;
};
