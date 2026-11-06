# Changelog

## Unreleased (v0.3.1)

### Added
- `ConfirmModal showTitle`: shows the title as a visible heading, so the question names the item ("Delete Sports day?").

### Changed
- Toast: the container sits `--toast-offset` above the bottom (1rem when unset), so an app can lift it over its docked bar or tab bar.

## Unreleased (v0.4.0, parts)

### Added
- `StageStatus` and `StageStatusButton` (`shell`): the status line at the foot of a stage.
- `SaveIndicator`: the quiet save state (`idle` hidden or resting, `dot` or `check`).
- `lib/whatsNew` (`createWhatsNew`, `parseNotes`, `decodeNotes`) and `WhatsNewCard`.
- `clay/PictureBox` (`PictureBox`, `lazyPicture`) and `clay/fit` (`outlineOf`, `fitTo`, `fitBox`).
- `AuthShell` (`split`, `window` and `card` layouts), `ServerStatusChip`, `FormError`, `AuthArt`, and `styles/signin.css`.
- `lib/shortcuts` (`createShortcuts`, `shortcutRows`, `MOD_KEY`), `ShortcutList` and `ShortcutSheet`.
- `build` entry: the `lazyLucideCatalogue` Vite plugin.
- Chrome icon names `logOut`, `panelRight`, `copy`, `numberedList`, `redo`, `heading`, `indentMore`, `indentLess`, `clearFormatting`, and `icons/chromeGlyphs` (`chromeGlyphs`, the line-style set).

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
