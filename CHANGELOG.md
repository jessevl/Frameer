# Changelog

## Unreleased (v0.3.0)

### Added
- `PropertyRow` (`icon` or `line`, `label`, `children`, `second`, `onClick`, `tone`), `PropertyGrid` (88px 1fr 1fr), `PanelSection` and `AddChip`.
- `AdaptiveDialog`: a `Modal` on the desktop, a `MobileSheet` below 768 px, the same props.
- `ConfirmModal` and `requestConfirm` take `children` that name what is lost.
- Toast: `toastWithAction`, `variant: 'pill'`, `countdown`; `lib/pausableTimer`.

### Changed
- **Breaking:** `PropertyRow` is no longer the planneer row (`label`, `icon`, `value`, `active`; a named default export). It had no users in Harbour, Drift, Lighthouse or Yard.
- `Modal` handles Escape (top dialog only), moves focus in (`data-autofocus`), keeps Tab inside and returns focus.
- Toast: the timer pauses while the pointer or the focus is on the toast, and the toast has `role="status"` (`alert` for errors). The store no longer sets the timeout itself; `ToastContainer` must be mounted for a toast to expire.
- `ConfirmModal` names its dialog by its title (header stays hidden).
