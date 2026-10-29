/**
 * @file useShellMode.ts
 * @description Which shell the window gets, by width alone: the phone shell (pill header and tab bar) below 768 px, the compact shell (rail only; the pane floats over the stage on hover or ⌘\) from 768 to 1100 px, and today's two cards above 1100 px.
 * Why: Frameer's useIsMobile follows the device, so a desktop window narrowed to 390 px kept the rail and pane and squeezed the stage to about 60 px, and a touch laptop at full width got the phone shell. Width is read live from matchMedia, so resizing across a breakpoint switches shells without a reload.
 * Used by: AppShell, SidePanel, the pane hook and every section that lays out differently on a phone.
 */
import { useMediaQuery } from '@frameer/hooks/useMobileDetection';

/** The phone shell ends here (exclusive). */
export const PHONE_MAX = 768;
/** The compact shell (rail only) ends here (inclusive); above it the pane docks next to the stage. */
export const COMPACT_MAX = 1100;

const NARROW = `(max-width: ${PHONE_MAX - 1}px)`;
const COMPACT = `(min-width: ${PHONE_MAX}px) and (max-width: ${COMPACT_MAX}px)`;

/** True for the phone shell: any window narrower than 768 px, whatever the input device. */
export function useIsMobile(): boolean {
  return useMediaQuery(NARROW);
}

/** True for windows from 768 to 1100 px, where the pane floats over the stage instead of docking. */
export function useIsCompact(): boolean {
  return useMediaQuery(COMPACT);
}
