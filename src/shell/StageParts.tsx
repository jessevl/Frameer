/**
 * @file StageParts.tsx
 * @description What a page contributes to the shell around it: `StageCrumb` names the thing it shows in the breadcrumb (the stage store's `crumb`), and `PanelContent` fills the side panel for as long as the page is mounted. The panel has no tabs: `title` is its heading in the docked bar, `onClose` gives it a close button, `onBack` a Back arrow (while a sub-view shows), and `wide` widens it while a form is open. The children are portalled into the panel, so they keep the page's state and live data; several sections go in one scroll as children. The stack of sub-views is `usePanelStack`.
 * Used by: pages with a detail or a side panel.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useStageStore } from './stageStore';

export function StageCrumb({ label }: { label: string | null }) {
  const setCrumb = useStageStore((s) => s.setCrumb);
  useEffect(() => {
    setCrumb(label);
    return () => setCrumb(null);
  }, [label, setCrumb]);
  return null;
}

export interface PanelContentProps {
  /** The heading in the docked bar. */
  title: string;
  /** Gives the panel a close button; the page decides what closing means. */
  onClose?: () => void;
  /** Gives the panel a Back arrow, for a sub-view. */
  onBack?: () => void;
  /** A form is open: the panel widens. */
  wide?: boolean;
  children: ReactNode;
}

export function PanelContent({ title, onClose, onBack, wide = false, children }: PanelContentProps) {
  const setTitle = useStageStore((s) => s.setPanelTitle);
  const setClose = useStageStore((s) => s.setPanelClose);
  const setBack = useStageStore((s) => s.setPanelBack);
  const setWide = useStageStore((s) => s.setPanelWide);
  const target = useStageStore((s) => s.panelTarget);
  // The callbacks change identity every render; the bar calls the latest through these refs.
  const closeRef = useRef(onClose);
  const backRef = useRef(onBack);
  useEffect(() => {
    closeRef.current = onClose;
    backRef.current = onBack;
  });
  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [title, setTitle]);
  const closable = onClose !== undefined;
  useEffect(() => {
    setClose(closable ? () => closeRef.current?.() : null);
    return () => setClose(null);
  }, [closable, setClose]);
  const backable = onBack !== undefined;
  useEffect(() => {
    setBack(backable ? () => backRef.current?.() : null);
    return () => setBack(null);
  }, [backable, setBack]);
  useEffect(() => {
    setWide(wide);
    return () => setWide(false);
  }, [wide, setWide]);
  return target ? createPortal(children, target) : null;
}
