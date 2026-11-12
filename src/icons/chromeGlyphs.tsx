/**
 * @file chromeGlyphs.tsx
 * @description The chrome glyphs as named components: sign out, side panel, back, close, copy, check, and the compose toolbar's numbered list, redo, heading, indent and clear formatting. They are the Drift line drawings Frameer's chrome icons draw by default (`lineChrome`), so an app that passes them to `ChromeIconsProvider` (`<ChromeIconsProvider icons={chromeGlyphs}>`) or uses one directly draws the same icon as Frameer's own chrome, with no icon library. Each is a `ChromeIconComponent`: it takes `className`, `size` (default 24), `style` and the aria props; the line weight is the set's.
 * @app SHARED - Generic: knows nothing about any app.
 * Ported from harbour@frontend/src/ui/icons.tsx (after yard@frontend/src/icons/chrome.tsx); now drawn by the Drift line set.
 * Used by: apps that wrap their tree in `ChromeIconsProvider` with these as `icons`, or draw one of them directly.
 */
import { lineChrome, type ChromeIconComponent, type ChromeIconName } from '../components/ui/ChromeIcons';

export const LogOutGlyph = lineChrome('logout');
export const PanelRightGlyph = lineChrome('panel');
export const ChevronLeftGlyph = lineChrome('chevronleft');
export const CloseGlyph = lineChrome('close');
export const CopyGlyph = lineChrome('clipboard');
export const CheckGlyph = lineChrome('check');
export const NumberedListGlyph = lineChrome('numbered');
export const RedoGlyph = lineChrome('redo');
export const HeadingGlyph = lineChrome('heading');
export const IndentMoreGlyph = lineChrome('indent');
export const IndentLessGlyph = lineChrome('outdent');
export const ClearFormattingGlyph = lineChrome('clearformat');

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
