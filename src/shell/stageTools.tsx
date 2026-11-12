/**
 * @file stageTools.tsx
 * @description The slot list of the docked bar's tools: each view registers the tools it offers (a view switch, sort, filter, an add action) with `useStageTools`, and the bar draws them (`BarTools`) before the side panel toggle; a phone has no bar, so tools marked `phoneSwitch` show as a row under its header (`PhoneViewSwitch`). `StageToolsProvider` holds the list; `anchorOf` reads a button's box for tools that open a menu under it.
 * The type is Drift's `StageTool`, as every app has it: icon-only buttons (`line` or `icon`), pills with a value, a count or a dot, a labelled add button (`text`) with a split menu, a stepped slider, a `section` that groups neighbours into one segmented switch, and `node` for a control the view draws itself (Harbour's calendar switch). An app uses the fields it needs; coral on `text` and `primary` is the app's call, made by choosing those fields.
 * Pass a memoized list; the registration is replaced when it changes and removed when the view unmounts.
 * Used by: BarTools, PhoneViewSwitch, StageToolsProvider, and every view that adds tools.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import type { LineName } from '@frameer/icons/LineIcon';

/** Where a menu opens: at a point, or under a button's box. */
export interface ToolAnchor {
  x: number;
  y: number;
  rect?: { left: number; right: number; top: number; bottom: number };
}

/** The anchor for an element's box. */
export function anchorOf(element: Element): ToolAnchor {
  const rect = element.getBoundingClientRect();
  return { x: rect.left, y: rect.bottom + 4, rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom } };
}

/** Any icon component that takes a class and a stroke width (an app's icon component, such as a line drawing wrapped for its toolbar). */
export type ToolIcon = ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean | 'true' }>;

export interface StageTool {
  id: string;
  label: string;
  /** A component icon; a tool that sets `line` needs none. */
  icon?: ToolIcon;
  /** A line drawing drawn instead of `icon` (a section's segments are then icon-only, named by their label). */
  line?: LineName;
  /** A quiet count after a pill's label; left out at 0. */
  count?: number;
  /** Gets the button's anchor, for tools that open a menu under it. */
  onClick: (anchor: ToolAnchor) => void;
  /** The tool is on (a view mode, an open menu). */
  active?: boolean;
  /** A dot for a filter that is applied. */
  dot?: boolean;
  /** Draws the tool as a labelled coral button (an add action) instead of an icon button. */
  text?: string;
  /** Draws the tool as an outlined pill with its label, instead of an icon button. */
  pill?: boolean;
  /** The value a pill names after its label (Group · Due date), in the quiet ink. */
  value?: string;
  /** Draws `count` as a coral badge instead of the quiet number. */
  countBadge?: boolean;
  /** A pill filled with coral: the view's one primary action that is not an add. */
  primary?: boolean;
  /** A chevron beside a labelled tool, which opens a menu of the other things it can add. */
  split?: { label: string; onClick: (anchor: ToolAnchor) => void; open?: boolean };
  /** A stepped slider with a small and a large tile glyph at its ends; `onClick` is what a phone menu runs instead. */
  slider?: { steps: number; value: number; onChange: (value: number) => void };
  /** A pill that also draws the tool's icon before its label. */
  pillIcon?: boolean;
  /** Neighbouring tools with the same section draw as one segmented group, the active one marked as current. */
  section?: string;
  /** A phone has no bar: the tool of a switch shows as a row under its header (PhoneViewSwitch) and stays out of a More menu. */
  phoneSwitch?: boolean;
  /** The phone has its own create button; the tool stays out of its More menu. */
  desktopOnly?: boolean;
  /** Names a motion in the app's motion.css ("icons that answer back"): written to `data-motion`. */
  motion?: string;
  /** A control of its own drawn in place of the button. It brings its own label and keyboard handling. */
  node?: ReactNode;
}

export interface StageToolsValue {
  tools: StageTool[];
  setTools: (tools: StageTool[]) => void;
}

/** The registry's context, for an app that provides it itself (a test, a shell with its own provider) or reads it whole (`useStageToolsRegistry`). */
export const StageToolsContext = createContext<StageToolsValue>({ tools: [], setTools: () => undefined });

export function StageToolsProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<StageTool[]>([]);
  const value = useMemo(() => ({ tools, setTools }), [tools]);
  return <StageToolsContext.Provider value={value}>{children}</StageToolsContext.Provider>;
}

/** The registry whole: the tools the view registered and the setter that replaces them (what `useStageTools` calls). */
export function useStageToolsRegistry(): StageToolsValue {
  return useContext(StageToolsContext);
}

/** The tools the current view registered. */
export function useRegisteredStageTools(): StageTool[] {
  return useContext(StageToolsContext).tools;
}

/** Registers the tools of a view for as long as it is mounted. `null` registers nothing (a listing inside a page leaves the tools to the page). */
export function useStageTools(tools: StageTool[] | null): void {
  const { setTools } = useContext(StageToolsContext);
  useEffect(() => {
    if (tools === null) return;
    setTools(tools);
    return () => setTools([]);
  }, [tools, setTools]);
}
