/**
 * @file stageStore.ts
 * @description What the page in the stage tells the shell around it: the name of the thing it shows (the breadcrumb's last crumb) and the side panel's state. A page fills the panel with `PanelContent` (StageParts), which sets here the heading (`panelTitle`; null means no page fills the panel), the Back arrow (`panelBack`, set while the page shows a sub-view), the close button (`panelClose`) and whether the form open in it needs the wide panel (`panelWide`); `panelTarget` is the panel's body element, where the content is portalled. Not persisted: a page sets these while it is mounted and clears them when it goes.
 * Why in Frameer: all four apps held this same store; the panel state has no app policy in it.
 * Used by: StageParts, SidePanel, DockedBar, and an app's own breadcrumb (`crumb`).
 */
import { create } from 'zustand';

interface StageState {
  /** The last crumb of the breadcrumb when a page shows one thing (a person, a message); null leaves the section's own. */
  crumb: string | null;
  /** The heading of the panel's content, in the docked bar; null when no page fills the panel. */
  panelTitle: string | null;
  /** True while a form is open in the panel: the panel widens. */
  panelWide: boolean;
  /** The element the panel's body is portalled into. */
  panelTarget: HTMLElement | null;
  /** What the panel's close button does; null leaves the button out. */
  panelClose: (() => void) | null;
  /** What the Back arrow does (leave the sub-view); null leaves the arrow out. */
  panelBack: (() => void) | null;
  setCrumb: (crumb: string | null) => void;
  setPanelTitle: (title: string | null) => void;
  setPanelWide: (wide: boolean) => void;
  setPanelTarget: (target: HTMLElement | null) => void;
  setPanelClose: (close: (() => void) | null) => void;
  setPanelBack: (back: (() => void) | null) => void;
}

export const useStageStore = create<StageState>()((set) => ({
  crumb: null,
  panelTitle: null,
  panelWide: false,
  panelTarget: null,
  panelClose: null,
  panelBack: null,
  setCrumb: (crumb) => set({ crumb }),
  setPanelTitle: (panelTitle) => set({ panelTitle }),
  setPanelWide: (panelWide) => set({ panelWide }),
  setPanelTarget: (panelTarget) => set({ panelTarget }),
  setPanelClose: (panelClose) => set({ panelClose }),
  setPanelBack: (panelBack) => set({ panelBack }),
}));
