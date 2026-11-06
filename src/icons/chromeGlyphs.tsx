/**
 * @file chromeGlyphs.tsx
 * @description The chrome glyphs an app draws itself in the line style (stroke 1.7, round caps and joins) instead of taking Lucide's: sign out, side panel, back, close, copy, check, and the compose toolbar's numbered list, redo, heading, indent and clear formatting. They are plain inline SVG, so an app that gives them to `ChromeIconsProvider` (`<ChromeIconsProvider icons={chromeGlyphs}>`) needs no icon library for its chrome. Each is a `ChromeIconComponent`: it takes `className`, `size` (default 24), `strokeWidth` and `style`.
 * @app SHARED - Generic: knows nothing about any app.
 * Ported from harbour@frontend/src/ui/icons.tsx (after yard@frontend/src/icons/chrome.tsx; the compose glyphs are drawn after Lucide's, ISC).
 * Used by: apps that wrap their tree in `ChromeIconsProvider` with these as `icons`.
 */
import React from 'react';
import type { ChromeIconComponent, ChromeIconName } from '../components/ui/ChromeIcons';

/** One glyph from its path data (24 x 24 grid), with the shared stroke style. */
function glyph(paths: ReadonlyArray<React.ReactElement | string>): ChromeIconComponent {
  const Glyph: ChromeIconComponent = ({ className, size = 24, strokeWidth = 1.7, style, 'data-chrome': dataChrome, 'aria-hidden': ariaHidden = true }) => (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      focusable="false"
      className={className}
      style={style}
      data-chrome={dataChrome}
    >
      {paths.map((p, i) => (typeof p === 'string' ? <path key={i} d={p} /> : React.cloneElement(p, { key: i })))}
    </svg>
  );
  return Glyph;
}

export const LogOutGlyph = glyph(['M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10M15 8l4 4-4 4M19 12H9']);
export const PanelRightGlyph = glyph([<rect key="r" x="3" y="4" width="18" height="16" rx="3" />, 'M14.5 4v16']);
export const ChevronLeftGlyph = glyph(['m15 6-6 6 6 6']);
export const CloseGlyph = glyph(['M6 6l12 12M18 6 6 18']);
export const CopyGlyph = glyph([<rect key="r" x="8.5" y="8.5" width="11" height="11" rx="2.5" />, 'M15.5 8.5V6.5A2.5 2.5 0 0 0 13 4H6.5A2.5 2.5 0 0 0 4 6.5V13a2.5 2.5 0 0 0 2.5 2.5h2']);
export const CheckGlyph = glyph(['m5 12.5 4.5 4.5L19 7.5']);
export const NumberedListGlyph = glyph(['M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1']);
export const RedoGlyph = glyph(['m15 14 5-5-5-5M20 9H9.5A5.5 5.5 0 0 0 4 14.5 5.5 5.5 0 0 0 9.5 20H13']);
export const HeadingGlyph = glyph(['M6 12h12M6 20V4M18 20V4']);
export const IndentMoreGlyph = glyph(['M21 12H11M21 6H11M21 18H11M3 8l4 4-4 4']);
export const IndentLessGlyph = glyph(['M21 12H11M21 6H11M21 18H11M7 8l-4 4 4 4']);
export const ClearFormattingGlyph = glyph(['M4 7V4h16v3M5 20h6M13 4 8 20M15 15l5 5M15 20l5-5']);

/** The set, keyed by chrome icon name: pass it as `icons` to `ChromeIconsProvider` (all of it, or pick the names you want). */
export const chromeGlyphs: Readonly<Partial<Record<ChromeIconName, ChromeIconComponent>>> = {
  logOut: LogOutGlyph,
  panelRight: PanelRightGlyph,
  chevronLeft: ChevronLeftGlyph,
  close: CloseGlyph,
  copy: CopyGlyph,
  check: CheckGlyph,
  numberedList: NumberedListGlyph,
  redo: RedoGlyph,
  heading: HeadingGlyph,
  indentMore: IndentMoreGlyph,
  indentLess: IndentLessGlyph,
  clearFormatting: ClearFormattingGlyph,
};
