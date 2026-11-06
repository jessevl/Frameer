# Frameer

A reusable React UI framework with Tailwind CSS theming for building applications with consistent UI patterns.

## Features

- **43+ UI Components** - Buttons, Modals, Cards, Tables, Toasts, and more
- **Design Tokens** - Comprehensive theming system with light/dark mode
- **Responsive Hooks** - Mobile detection, click outside, long press gestures
- **State Management** - Settings and confirmation stores (Zustand-based)
- **TypeScript** - Full type safety throughout

## Installation

```bash
npm install @frameer/ui
# or
pnpm add @frameer/ui
```

## Usage

### Import Styles

In your app's global CSS file:

```css
@import "@frameer/ui/styles/tokens.css";
@import "@frameer/ui/styles/base.css";
```

### Use Components

```tsx
import { Button, Modal, Card, useIsMobile } from '@frameer/ui';

function App() {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

### Theme Initialization

Add the ThemeInitializer to your app root:

```tsx
import { ThemeInitializer } from '@frameer/ui';

function App() {
  return (
    <>
      <ThemeInitializer />
      {/* Your app content */}
    </>
  );
}
```

## Package Exports

| Export | Description |
|--------|-------------|
| `@frameer/ui` | Main entry - all exports |
| `@frameer/ui/components` | All UI components |
| `@frameer/ui/components/ui` | Core UI primitives |
| `@frameer/ui/components/ui/date` | Date and time pickers, with the wall-date helpers |
| `@frameer/ui/hooks` | React hooks |
| `@frameer/ui/stores` | Zustand stores |
| `@frameer/ui/lib` | Utility functions |
| `@frameer/ui/contexts` | React contexts |
| `@frameer/ui/styles/tokens.css` | Design tokens CSS |
| `@frameer/ui/styles/base.css` | Base styles CSS |

## Components

### Form Components
- Button, Input, Textarea, Toggle, Checkbox
- ColorPicker, EmojiPicker, IconPicker, Select

### Layout Components
- Card, Panel, Container, Sidebar, Header
- Modal, ModalFooter, Divider, Stack, FlexGroup
- MobileSheet, HorizontalScrollContainer
- AdaptiveDialog (a Modal on the desktop, a sheet below 768 px, same props)

### Side panels

`PropertyGrid` is a grid of an 88 px label column and two value columns; `PropertyRow` lays itself across it (`children` over both value columns, or `children` and `second` side by side). Outside a grid it is a flex row, the label left and the value right. `icon` takes a node and `line` a Drift line icon (drawn static); `tone` colors it: `accent` (coral, the default) or `grey`, for apps where coral marks actions only. With `onClick` the whole row is one button, so keep its children plain text. `PanelSection` is a region under a kicker, and `AddChip` is the dashed "Add ..." button at the foot of a list.

### Dialogs

`Modal` follows the keyboard rules of a dialog: Escape closes the top dialog only, focus moves in when it opens (to the element marked `data-autofocus`, else the first control), Tab and Shift+Tab stay inside, and focus returns to what had it. `ConfirmModal` (with `useConfirmStore`) takes children, or `requestConfirm({ children })`, that name what is lost.

### Display Components
- Badge, Popover, ColorDot, EmptyState
- ContextMenu, Dropdown, DataTable

### Menus

`useContextMenu(items, { label })` gives a row or card its context menu and returns `{ triggerProps, open(anchor), close, isOpen, menu }`:

- spread `triggerProps` on the row: a right click, a 500 ms long press on touch (the click after it is swallowed), and the Menu key or Shift+F10 open the menu; text fields keep the browser's own menu;
- call `open(element)` from a `…` button, render `menu` anywhere, and use `isOpen` to draw the row's ring;
- `items` is a function, read on every render while the menu is open; a menu with no items does not open.

The menu opens at the pointer or under the element (a sheet on a phone), moves the focus to its first item, and works like a native menu: Arrow up and down wrap, Home and End, Right opens a submenu and Left closes it, Enter and Space choose, a typed letter jumps, Escape closes it and returns the focus. A `ContextMenuItem` takes `hint` (the shortcut, right-aligned), `heading` (a quiet label above a group), `checked` (`menuitemradio`; with `checkbox`, `menuitemcheckbox`), `keepOpen`, `divider`, `variant: 'danger'`, `children` (a submenu), `quick` and `toggled`. `<ContextMenu items>` wraps children in the same menu, and `ContextMenuContent` is the list on its own.

### Date and time pickers

From `@frameer/components/ui/date` (also in `@frameer/components`). They work in wall values only, `IsoDate` (`YYYY-MM-DD`) and `WallTime` (`HH:MM`, 24 h), use no date library, and never read the clock: the app passes `today` in its own time zone.

| Component | What it is |
| --- | --- |
| `CalendarGrid` | A month grid (`role="grid"`): today ringed, the chosen day filled, a `range` tinted, `marked` days dotted; the month title opens a year list; arrows, Page Up and Down (Shift for a year), Home and End; `min`, `max`, `weekStartsOn` (Monday by default) |
| `DateField` | A field reading "Tue 10 Nov" (with the year when it is not this year) that opens the grid in a popover, a sheet on a phone; `quick` adds Today, Tomorrow and Next Monday, `clearable` adds Clear |
| `TimeField` | A text field that takes "830", "8:30", "8.30" or "8pm" and settles on blur to `08:30`; a list of `step` minutes opens below, and with `from` each step shows its length ("09:30 · 1 h 30"); an unreadable value says so under the field |
| `TimeRangeFields` | From and To; moving From moves To by the same length, To never ends before From |
| `DateRangeFields` | From and To dates sharing one grid that shows the range; moving From keeps the length |
| `DateTimeField` | A day and a time as one control, with an optional `min` moment |

Fields are 36 px with 14 px text (44 px and 16 px on a phone). Popovers and the time list are marked `data-floating-panel`, and Escape closes only them, not the panel that hosts the field. `FloatingSurface` is the shared shell (placement, phone sheet, outside press, Escape).

### Typography
- H1, H2, H3, H4, Text, TextSmall, Label

### Feedback
- Toast (with toastSuccess, toastError, etc.). The timer pauses while the pointer or the focus is on a toast. `toastWithAction(message, { label, onClick }, { duration, countdown, variant })` shows an action with the seconds left beside it; `variant: 'pill'` is the dark pill.
- ErrorBanner, StatusBanner
- SmartEmptyState

### Parts (v0.4)

- **`StageStatus`** (`@frameer/shell`; `{ parts, children?, trailing?, label?, testId? }`): the status line at the foot of a stage, dot-separated, one polite live region; `StageStatusButton` sits among the parts.
- **`SaveIndicator`** (`{ status: 'idle' | 'saving' | 'saved' | 'failed', idle?: 'hidden' | 'saved', variant?: 'dot' | 'check', labels?, problem? }`): the quiet save state, which keeps its place.
- **`createWhatsNew`** (`lib/whatsNew`; `{ seenKey, version, notes }`, notes as base64) and **`WhatsNewCard`** (`{ source, appName, picture?, onSeen? }`). The app reads its own `import.meta.env` values.
- **`PictureBox`** and **`lazyPicture`** (`@frameer/clay/PictureBox`), and **`fit`** (`outlineOf`, `fitTo`, `fitBox`).
- **`AuthShell`** (`@frameer/shell`; `variant: 'split' | 'window' | 'card'`, `brand`, `status`, `title`, `subtitle`, `footnote`, `art`, `wide`, `bare`: a `card` with `bare` renders the children directly in the frame), with `ServerStatusChip`, `FormError` (no outer margin: pass `className="mb-4"`) and `AuthArt` (`tiles`, `caption`, `tilesAbove`). `ShortcutSheet` takes a `header` slot; chrome icons take `role` and `aria-label`; `PictureBox` passes `data-*` through; `lazyPicture(load, 'Name')` maps a named export with its props inferred. `shell/parts` also exports `StageStatus`, `StageStatusButton`, `AuthShell`, `FormError`, `ServerStatusChip` and `AuthArt`. Import `styles/signin.css` for the art's motion.
- **`createShortcuts(keymap, options?)`** (`lib/shortcuts`): the keymap as data, `resolve`, a handler registry, `useShortcut` and the one `useListener`; **`ShortcutList`** and **`ShortcutSheet`** (`rows` from `shortcutRows(keymap)`). Generic over the app's scopes; the keymap stays in the app.
- **Build.** `lazyLucideCatalogue()` (`./build`, a Vite plugin for production builds) keeps the Lucide catalogue out of the entry chunk and fails the build if Frameer's import moved.
- **Chrome glyphs.** `ChromeIcon` knows `logOut`, `panelRight`, `copy`, `numberedList`, `redo`, `heading`, `indentMore`, `indentLess` and `clearFormatting` (Lucide by default). `chromeGlyphs` (`@frameer/icons`) is the same set, and `check`, `close` and `chevronLeft`, drawn in the line style with no icon library: pass it as `icons` to `ChromeIconsProvider`.

## Hooks

- `useIsMobile()` - Mobile viewport detection
- `useIsTablet()` - Tablet viewport detection
- `useIsDesktop()` - Desktop viewport detection
- `useMediaQuery(query)` - Custom media query hook
- `useClickOutside(refs)` - Click outside detection
- `useLongPress(options)` - Long press gesture
- `useContextMenu(items, options)` - A context menu on any element (see Menus)
- `usePhoneWidth()` - True below 768 px, where menus and pickers open as sheets
- `useAutoSave(callback, deps, delay)` - Debounced autosave

## Stores

- `useSettingsStore` - Theme, accent color, and app settings
- `useConfirmStore` - Confirmation modal state

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Type check
npm run typecheck

# Tests
npm test
```

Frameer's tests (`src/**/*.test.{ts,tsx}`, Vitest in jsdom, Testing Library and axe-core) run on the dev tools of the app Frameer sits in (`frontend/frameer` in Drift, Harbour, Lighthouse and Yard), found in the app's `node_modules` one level up; Frameer adds no dev dependencies for them. An app can also run them in its own suite with a Vitest project that includes `frameer/src/**/*.test.{ts,tsx}`.

## License

MIT

## Menus, avatars, segmented control and styles (v0.3)

- **Context menu items** take `line` (one of the suite's line icons) and `choices`: a compact row of round options, either color swatches or avatars, one choice (`menuitemradio`) or several (`menuitemcheckbox`). The chosen option has a coral ring. Several choices keep the menu open; Up and Down treat the row as one stop, Left and Right move between options. Each option has a name and a tooltip.
- **`Avatar`** (`{ name, hue?, src?, size?, initials?, ringed?, label? }`) and **`AvatarStack`** (`{ people, label, max? }`). The app picks each person's `HueName`.
- **`Segmented`** (`{ label, options: { id, label, line?, icon? }[], value, onChange, iconOnly? }`) and **`ThemeChoice`** (`{ value, onChange, iconOnly? }`).
- **Styles.** Import what the app uses: `@frameer/ui/styles/motion.css`, `density.css`, `hues.css`, `paper.css`, `shell.css`, `print.css`, `reading.css`. `lib/hues` has `HueName` and `hueVar`; `lib/paper` has `paperWash`, `grainField` and `usePaper`, which `paper.css` lays behind `.paper-surface`.

## Shell parts (v0.4)

The rail, bars, panes and phone chrome of Drift, Harbour, Yard and Lighthouse, as generic parts in `@frameer/shell` (import from `@frameer/shell/<File>`). Sections, crumbs, routes, marks, sync objects, pane contents and the app's own stores stay in the app, as props and slots. The coral rules are the app's too: it decides which tools carry `primary` or `text`. Needs `@tanstack/react-router`; the phone parts need `@frameer/ui/styles/phone.css` and `shell.css`.

- **`Rail`** (`{ mark, markLabel, markHref?, onMark?, sections: RailSection[], activeId, leading?, between?, footer?, hover?, hoverScope?, renderSection? }`) and `RailLink` for a footer link drawn like a section. `RailSection` is `{ id, label, line, to? | onSelect?, title? }`.
- **`usePane(controls, { forceFloating?, none? })`** takes the app's flags and actions (`PaneControls`: `collapsed`, `open`, `setOpen`, `toggleCollapsed`, `toggleOpen`, `openOnHover`, `closeOnLeave`) and returns `PaneState` (`docked`, `floating`, `open`, `forced`, `none`, `toggle`, `close`, `hover`). The app wraps it in its own `usePane()`, or skips the wrapper with `usePaneFromStore(useStore, { collapsed: 'paneCollapsed', open: 'paneOpen', setOpen: ..., toggleCollapsed: ..., toggleOpen: ..., openOnHover: ..., closeOnLeave: ... }, options?)`, which reads each key from a zustand store. **`FloatingPane`** (`{ pane, children, testId?, ignore?, stopEscape?, followSelector? }`) is the card that slides over the stage.
- **`DockedBar`** (`{ crumbs, middle?, trailing?, panel?: { open, toggle, heading?, slide?, wide? } }`), **`PillHeader`** (`{ crumbs: Crumb[], bar?, stretch?, onBack?, titleId?, renderCrumb?, renderSeparator?, trailing? }`), **`BarTools`** (`{ leading?, trailing?, panelToggle?, divider? }`) and **`PanelToggle`** (`{ open, onToggle, icon? }`).
- **Stage tools:** `StageToolsProvider`, `useStageTools(tools | null)`, `useRegisteredStageTools`, the `StageTool` type (Drift's: icon-only buttons, pills, a coral add button with a split, a slider, `section` switches, `phoneSwitch`, `node`) and `anchorOf`. **`PhoneViewSwitch`** draws the `phoneSwitch` tools under a phone header.
- **`SidePanel`** (`{ open, onClose, enabled?, empty?, label?, children?, heading?, phone?: 'full' | 'sheet', requireContent?, slide?, floating?, ignore?, paper?, wide? }`), **`PanelContent`** (`{ title, onClose?, onBack?, wide?, children }`, portalled into the panel), `StageCrumb`, `SidePanelHeading`, `PanelHeading`, `PanelSlide`, `usePanelWidth` and the store `useStageStore` (`crumb`, `panelTitle`, ...). The panel has no tabs: one scroll under a heading in the docked bar; 340 px, 480 px while a form is open.
- **The stack:** `usePanelStack(param?)` returns `{ stack, push, pop }`, held in the address (`?edit=a,b`), so a link, a reload and the browser's Back restore it. Routes keep the parameter with `panelSearch`.
- **`stageScroll`** and **`STAGE_SCROLL`** go on a view's own scroll container so it scrolls under the docked bar; `scrollStageToTop`.
- **Phone:** `PhoneHeader` (`{ title, subtitle?, onSubtitle?, leading?, back?, actions?, tools?, center?, compact?, largeTitle?, decorative?, headingId?, scrollKey? }`) with the large title that collapses as the list scrolls (`--title-p`), `PhoneTool` for the tools pill, **`PhoneTabBar`** (`{ tabs: PhoneTab[], activeId, create?, createAt?, onNavigate?, onActiveTap?, hideOnKeyboard?, bottomInset? }`), and `collapseProgress`, `useLargeTitleScroll`.
