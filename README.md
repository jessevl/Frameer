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
- Toast (with toastSuccess, toastError, etc.)
- ErrorBanner, StatusBanner
- SmartEmptyState

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
