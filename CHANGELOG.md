# Changelog

## Unreleased (v0.3.0)

### Added
- `ContextMenuItem.line` and `ContextMenuItem.choices` (swatch or avatar options, single or several, arrow keys, `keepOpen`, a coral ring on the chosen one). Types `ContextMenuChoice` and `ContextMenuChoices`.
- `Avatar` (with `initials`) and `AvatarStack`; `lib/hues` (`HUE_NAMES`, `HueName`, `hueVar`, `isHueName`).
- `Segmented` (with `iconOnly`) and `ThemeChoice`.
- Styles `motion.css`, `density.css`, `hues.css`, `paper.css`, `shell.css`, `print.css` and `reading.css`, and `lib/paper` (`paperWash`, `grainField`, `usePaper`), taken from Drift. The apps delete their copies and import these.

### Changed
- Nothing breaks: `ContextMenuItem.onClick` stays required (pass a no-op for a `choices` item).
