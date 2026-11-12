# Changelog

## Unreleased

### Added
- `RailFoot` (shell): the rail's foot in one order for every suite app, top to bottom: `sync`, `settings`, then `account` last. Pass it as the Rail's `footer`.
- `Modal` `titleStyle="heading"`: the title as a plain 24 to 26 px heading instead of the small kicker; the default is unchanged.
- Data parts, moved from Yard (`styles/parts.css`, import it beside `tokens.css`; additive, no existing export changes). `StatusWord` (ok, warn, bad, quiet and always a word), `Facts` and `Fact`, `FactTag` (the quiet outline pill; `Badge` is the tinted chip), `GlyphTile` (30, 40 or 52 px row icon), `Steps` and `Step`, `TickGauge`.
- `SegmentBar` (segments `{ id, label, value, color }`, total, height, `format`, `level`, `onActive`; a meter with an sr-only description and the room left as dots, the behaviour of Drift's StorageBar), `DotMeter` (20 dots from `{ color, value }` segments), `FreePill` (dot meter, bold free, muted size, `level` normal, watch or critical) and the `MeterLevel` type.
- Icon kit (`icons/glass`): two more arrangements of the sheets behind a card, so each app's mark has its own. `horizon` (Harbour) is the straight stack on its side, showing left and right of the card; `cascade` (Yard) steps up and to the right, each sheet smaller than the one in front. `straight` (Drift) and `fan` (Lighthouse) are unchanged, byte for byte (`glass.test.ts`).
- `sheetRects(f, layout, small)`: the sheets' rectangles and turns, back to front, and `flatSheets(f, layout, small, fill)`: the same sheets in one paint, for the flat drawings that had their own copy of the straight stack's geometry.

- `icons/appMark`: the app-mark recipe Drift's and Yard's marks each had a copy of (cream ink, coral glass, the coral front, the home-screen tile of the backdrop and maskable variants, the monochrome frame). Their output is unchanged, byte for byte.
- Line drawings `cpu` (Processor), `power` (Power) and `log` (Log), moved from Yard, where they were drawn for its sections; `SYNC_STROKES` (`icons/line/core`), the sync mark's strokes, which Drift's app icon draws too.

### Changed
- **An app can no longer replace a drawing of the line set.** `registerLineIcons` takes only new names (`NewLineDefs`: a set name is typed `never`) and throws on a name the set draws. Before, an app's drawing won (Yard's `people` and `terminal` were drawn in Frameer's own chrome too). Harbour's registrations reuse `bell`, `cloud`, `globe`, `key`, `lock`, `people`, `phone`, `pin`, `server` and `shield`, Lighthouse's `alert`, `check`, `circle`, `close`, `grip`, `highlight`, `logout`, `mute`, `pause`, `pin`, `pip`, `play`, `plus`, `refresh`, `server` and `square`: at its next bump each app uses the set's drawing or gives its own a name of its own.
- `people`: the one in front outlined, the one behind in a flat tint (Yard's drawing, which reads at rail size where two outlines ran together); same gesture.
- **Every chrome icon is a Drift line drawing.** `ChromeIcon` draws each name with `LineIcon` by default instead of Lucide (an app's `ChromeIconsProvider` can still replace any of them); the plain SVGs of `common/Icons` (all but `JournalCalendarIcon`) draw through `ChromeIcon` under new names (`sidebar`, `allTasks`, `today`, `upcoming`, `completed`, `collection`, `viewOptions`, `layout`, `cardView`, `skip`, `chart`, `listChecks`, `whiteboard`, `textFormat`, `readingPane`, `readingPaneOff`); `chromeGlyphs` are the same line drawings (`lineChrome`); `ThemeChoice` draws `monitor`, `today` and `moon`. The provider's `style` now applies only to icons drawn by a runtime name. Lucide is imported only by the custom-icon path (`lib/lucideCatalogue.ts`, `Icon.tsx`). Apps that relied on Lucide's look for chrome icons see the line set instead.
- **The line set grows from 81 to 262 drawings**, split by group into `src/icons/line/` (`kit.ts`, `core.ts`, `actions.ts`, `arrows.ts`, `marks.ts`, `text.ts`, `things.ts`, `layout.ts`, `photo.ts`); `line.ts` is the registry (`allLineNames()`; a name drawn twice throws). New: chevrons and arrows (one drawing turned four ways), corners, resize, fullscreen, expand, shrink, undo, redo, restore, rotate, refresh, repeat, flips, zoom, sign out, compare, split, check marks, close, plus, minus, alerts, loader, lock, shield, crown, key, hidden, bug, offline, plain shapes, formatting and list marks, calendars, bookmarks, flag, files, folders, globe, mail, phones, monitor, plug, music, film, slides, note, timer, media controls, people, databases, gauge, idea, pin, sliders, stamp, bandage, pipette, charts, table bands, grids, layout, grips, frame, crop, crosshair, vignette, grain, the photo editor's tools, and the suite chrome's bell, box, send, wrap, USB, terminal, cloud and server.
- `styles/motion.css`: one small gesture vocabulary for the new parts (`go*` nudges the way a part points, `cw`/`ccw`/`half` turns, `twist`, `shake`, `grow`, `press`, `lean`, `ink` draws a stroke in, `u1`-`u3` bars grow, `swing`, `flap`, `ring`, `spinx`, `pull`, `tilt`, and the pivots `hand`, `ndl`, `beam`), all inside `prefers-reduced-motion: no-preference`; no loops. The whole-icon gestures keyed on `data-chrome` are gone (each drawing moves its own parts). `LineIcon` takes `on` (`data-on`): a stateful drawing's fill shows in the icon's color (`--icon-on`).

### Removed
- `Icon` and `withStandardIcon` (`components/ui`): a wrapper that drew a static Lucide component, used by no app; draw a `LineIcon` instead. Only the custom-icon catalogue imports `lucide-react` now, and the line set's test fails on any other importer of it or of the catalogue.

## v0.4.5 (7 Nov 2026)

### Fixed
- SidePanel: floating over the stage (below 1024px) the panel sits at the right edge and its content scrolls; it no longer carries `paper-surface`, whose `position: relative` beat the `absolute` utility and left the card at the left, as tall as its content. A floating panel whose content goes away (the page closed it through its own route) closes with it instead of staying as an empty card until the next press; a panel opened empty on purpose stays open.

### Changed
- `useContextMenu`: every context menu is one width (`w-64`, 256px) instead of sizing to its longest label between 200 and 320px, so the menus of an app look alike. `FloatingSurface` still caps it on narrow windows.

## v0.4.4 (6 Nov 2026)

### Changed
- Paper grain: the light and dark tiles ship as static PNGs (`src/styles/grain/{light,dark}{,-low}.png`, made once from `lib/grain.ts` by `scripts/gen-grain.ts`) and `paper.css` references them by screen density (the `-low` tile and 256/density sizing replace the script's `dpr < 1.5` rule). Nothing is built or PNG-encoded at start: that was a 256x256 field and two canvas encodes, about 50 ms (200 ms at 4x CPU) in the startup long tasks. `usePaper` stays and only sets the hour's wash; it no longer takes the idle callback. `grain.test.ts` fails when the generator and the shipped PNGs differ. The tiles are written from straight (not premultiplied) pixels, so a speck may differ by one level from the old canvas round trip.
- `lib/paper` re-exports `GRAIN_SIZE`, `grainField` and the new `grainPixels` from `lib/grain`.

## v0.4.3 (6 Nov 2026)

### Added
- `SidePanel overlayBelow` (default 1024 px of window; 0 keeps it docked), `usePanelOverlay` and `PANEL_OVERLAY_BELOW`: below it a docked panel opens over the stage with a scrim, its own heading, and Escape or the scrim to close. `DockedBar`'s `panel.overlayBelow` must match, so the bar spans the window and draws no panel half. `floating` is unchanged.
- `Spinner`: a loading spinner in ink.
- `.touch-target` (base.css): a 44 px hit area on touch screens, through the element's `::after`.
- `PropertyGrid labelMax` (default `10rem`).

### Changed
- `PropertyGrid`: the label column fits the longest label up to `labelMax` instead of 88 px, and a longer label wraps instead of eliding.
- Disabled `Button`: grey ink on a quiet fill (`--paper-3`) instead of faded colors, so a disabled primary button meets 4.5:1 in dark.
- Tinted toasts: an opaque paper surface, the type's color on the border and icon, ink words (they failed contrast over the sign-in pages in light).

### Fixed
- `DockedBar`: the crumbs keep 9 rem and clip; `BarTools` shrinks and scrolls sideways instead of overflowing over the panel half.
- Touch targets: the toast's dismiss button, `Select` (all sizes) and `Checkbox` have a 44 px hit area on touch.

## v0.4.2 (6 Nov 2026)

### Added
- `SidePanel`: `ariaLabel` (default "Side panel"), `testId` and `leavingTestId` (the panel while it slides shut), `ownHeader` (content with its own sticky header: no `--stage-top` inset), `padded={false}` and `scrollContainer={false}`.
- `DockedBar`: `data-*` attributes and `testId` pass through to the bar; `stopAtPanel` ends the bar at the docked panel's edge.
- `PhoneHeader`: `subtitleLabel`, `subtitleTestId` and `scrollers` (a selector or predicate naming the scrollers that collapse the large title); `useLargeTitleScroll` takes the same as its fifth argument.
- `PhoneTool`: `onClick` gets the event, and the ref is forwarded (`PhoneToolProps`). `AppLink` forwards its ref.
- `StageToolsContext`, `useStageToolsRegistry` and `StageToolsValue` (`shell/parts`).
- `PictureBox as="span"`, so it can sit inside a button.
- `ShortcutRow.keys` takes a combination as an array (`['Ctrl', 'K']`), drawn as keycaps joined by "+"; `ShortcutKey` type.

### Changed
- `Crumb.label` is a `ReactNode`; a crumb with a node label needs a `key`.

### Fixed
- `SidePanel`: the empty portal target no longer takes `min-h-full`, which pushed `children` below a full panel height.
- `PhoneHeader`: the subtitle button's name is no longer fixed to "<title>: <subtitle>" (Lighthouse showed "Today: x" before v0.4.1).

## v0.4.1 (6 Nov 2026)

### Fixed
- `lazyPicture`: the implementation signature returns `unknown`, so both overloads type-check under every app's strictness (Yard's tsc refused v0.4.0).

## v0.4.0 (6 Nov 2026)

### Added
- `ConfirmModal showTitle`: shows the title as a visible heading, so the question names the item ("Delete Sports day?").
- `StageStatus` and `StageStatusButton` (`shell`): the status line at the foot of a stage.
- `SaveIndicator`: the quiet save state (`idle` hidden or resting, `dot` or `check`).
- `lib/whatsNew` (`createWhatsNew`, `parseNotes`, `decodeNotes`) and `WhatsNewCard`.
- `clay/PictureBox` (`PictureBox`, `lazyPicture`) and `clay/fit` (`outlineOf`, `fitTo`, `fitBox`).
- `AuthShell` (`split`, `window` and `card` layouts), `ServerStatusChip`, `FormError`, `AuthArt`, and `styles/signin.css`.
- `AuthShell bare`: in the `card` layout the children fill the frame, with no heading or padded wrapper (a side-by-side setup wizard).
- `AuthArt tilesAbove`: the tiles sit over the centre picture.
- `ShortcutSheet header`: a slot above the list, for a picture.
- `lazyPicture(load, 'Name')`: a named export as a lazy component, props inferred.
- `usePaneFromStore(useStore, keys, options?)`: builds the `PaneControls` from a zustand-like store and the names of its keys. `usePane(controls)` is unchanged.
- `lib/shortcuts` (`createShortcuts`, `shortcutRows`, `MOD_KEY`), `ShortcutList` and `ShortcutSheet`.
- `build` entry: the `lazyLucideCatalogue` Vite plugin.
- Chrome icon names `logOut`, `panelRight`, `copy`, `numberedList`, `redo`, `heading`, `indentMore`, `indentLess`, `clearFormatting`, and `icons/chromeGlyphs` (`chromeGlyphs`, the line-style set).

### Changed
- Toast: the container sits `--toast-offset` above the bottom (1rem when unset), so an app can lift it over its docked bar or tab bar.
- `FormError` has no `mb-4` of its own any more: the caller spaces it (`className="mb-4"`). No app imports it from Frameer yet.
- `ChromeIconProps` accepts `role`, `aria-label`, `aria-labelledby` and `focusable`, so an icon can be labelled.
- `PictureBox` passes `data-*` and other div props through to the box.
- `shell/parts` also exports `StageStatus`, `StageStatusButton`, `AuthShell`, `FormError`, `ServerStatusChip` and `AuthArt`; their own paths still work.

### Fixed
- `lazyPicture` infers its props for a named export mapped to `default` (or given by name) without an explicit generic.

## v0.3.0 (6 Nov 2026)

### Added
- `PropertyRow` (`icon` or `line`, `label`, `children`, `second`, `onClick`, `tone`), `PropertyGrid` (88px 1fr 1fr), `PanelSection` and `AddChip`.
- `AdaptiveDialog`: a `Modal` on the desktop, a `MobileSheet` below 768 px, the same props.
- `ConfirmModal` and `requestConfirm` take `children` that name what is lost.
- Toast: `toastWithAction`, `variant: 'pill'`, `countdown`; `lib/pausableTimer`.
- `ContextMenuItem.line` and `ContextMenuItem.choices` (swatch or avatar options, single or several, arrow keys, `keepOpen`, a coral ring on the chosen one). Types `ContextMenuChoice` and `ContextMenuChoices`.
- `Avatar` (with `initials`) and `AvatarStack`; `lib/hues` (`HUE_NAMES`, `HueName`, `hueVar`, `isHueName`).
- `Segmented` (with `iconOnly`) and `ThemeChoice`.
- Styles `motion.css`, `density.css`, `hues.css`, `paper.css`, `shell.css`, `print.css` and `reading.css`, and `lib/paper` (`paperWash`, `grainField`, `usePaper`), taken from Drift. The apps delete their copies and import these.

### Changed
- **Breaking:** `PropertyRow` is no longer the planneer row (`label`, `icon`, `value`, `active`; a named default export). It had no users in Harbour, Drift, Lighthouse or Yard.
- `Modal` handles Escape (top dialog only), moves focus in (`data-autofocus`), keeps Tab inside and returns focus.
- Toast: the timer pauses while the pointer or the focus is on the toast, and the toast has `role="status"` (`alert` for errors). The store no longer sets the timeout itself; `ToastContainer` must be mounted for a toast to expire.
- `ConfirmModal` names its dialog by its title (header stays hidden).
- Menus: nothing breaks; `ContextMenuItem.onClick` stays required (pass a no-op for a `choices` item).
