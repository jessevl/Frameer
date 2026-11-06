/**
 * @file parts.ts
 * @description The shell parts of v0.4, generic and configurable: the rail, the docked bar, the floating pane, the side panel with its stage store, `PanelContent` and stack, the breadcrumb, the phone header, tab bar and view switch, the stage tools, the status line (`StageStatus`), the signed-out frame (`AuthShell`, `AuthArt`, `FormError`, `ServerStatusChip`), and what they share (`usePane`, `stageScroll`). Sections, crumbs, pane contents, marks and sync objects stay in each app as props and slots; so do routes, the app's own stores and the coral rules. Re-exported by index.ts.
 * Used by: index.ts.
 */
export { Rail, RailLink, RAIL_ACTIVE, type RailProps, type RailSection } from './Rail';
export { DockedBar, type DockedBarPanel, type DockedBarProps } from './DockedBar';
export { FloatingPane, type FloatingPaneProps } from './FloatingPane';
export { HOVER_CLOSE_MS, HOVER_OPEN_MS, paneMode, usePane, usePaneFromStore, type PaneStoreKeys, type PaneControls, type PaneHover, type PaneOptions, type PaneState } from './usePane';

export { PANEL_WIDTH, PANEL_OVERLAY_BELOW, PANEL_WIDTH_WIDE, PanelHeading, PanelSlide, SidePanel, SidePanelHeading, usePanelOverlay, usePanelWidth, type PanelHeadingProps, type SidePanelProps } from './SidePanel';
export { PanelContent, StageCrumb, type PanelContentProps } from './StageParts';
export { useStageStore } from './stageStore';
export { PANEL_PARAM, panelSearch, parsePanelStack, poppedSearch, pushedSearch } from './panelStack';
export { usePanelStack, type PanelStack } from './usePanelStack';
export { StageStatus, StageStatusButton, type StageStatusProps } from './StageStatus';
export { AuthShell, AuthArt, FormError, ServerStatusChip, type AuthShellProps, type AuthArtProps, type AuthTile } from './AuthShell';
export { STAGE_SCROLL, scrollStageToTop, stageScroll } from './stageScroll';

export { PillHeader, type Crumb, type CrumbContext, type PillHeaderProps } from './PillHeader';
export { BarTools, PanelToggle, groupTools, type BarToolsProps } from './BarTools';
export { StageToolsContext, StageToolsProvider, anchorOf, useRegisteredStageTools, useStageTools, useStageToolsRegistry, type StageToolsValue, type StageTool, type ToolAnchor, type ToolIcon } from './stageTools';

export { PhoneHeader, PhoneTool, type PhoneBack, type PhoneHeaderProps, type PhoneToolProps } from './PhoneHeader';
export { COLLAPSE_PX, collapseProgress, useLargeTitleScroll } from './largeTitle';
export { PhoneTabBar, type PhoneTab, type PhoneTabBarProps } from './PhoneTabBar';
export { PhoneViewSwitch } from './PhoneViewSwitch';
