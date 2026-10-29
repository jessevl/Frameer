/**
 * @file index.ts
 * @description The glass shell's generic parts shared by Drift and Yard: a router-aware link, the phone drawer, the rail button style and the width-based shell mode hooks. The shell itself (rail, panes, bars) stays in each app because its sections are the app's.
 * @app SHARED - Generic: needs @tanstack/react-router (AppLink only).
 */
export { AppLink } from "./AppLink";
export { MobileDrawer } from "./MobileDrawer";
export { RAIL_BUTTON } from "./railStyles";
export { COMPACT_MAX, PHONE_MAX, useIsCompact, useIsMobile } from "./useShellMode";
