/**
 * @file index.ts
 * @description The glass shell's generic parts: a router-aware link, the phone drawer, the rail button style, the width-based shell mode hooks, and the v0.4 parts in parts.ts (rail, docked bar, panes, side panel, phone header and tab bar, stage tools). The sections, crumbs and pane contents stay in each app.
 * @app SHARED - Generic: needs @tanstack/react-router (AppLink only).
 */
export { AppLink } from "./AppLink";
export { MobileDrawer } from "./MobileDrawer";
export { RAIL_BUTTON } from "./railStyles";
export { COMPACT_MAX, PHONE_MAX, useIsCompact, useIsMobile } from "./useShellMode";
export * from "./parts";
