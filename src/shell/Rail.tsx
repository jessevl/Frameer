/**
 * @file Rail.tsx
 * @description The 62 px rail: the app's mark (it leads home), the sections as round icon buttons in a nav, and a footer at the bottom. The active section is a paper circle with the pill shadow. Resting the pointer on the sections opens the floating pane when the pane is not docked (`hover`, from `usePane`).
 * What differs per app is a prop or a slot: `leading` (Drift's and Lighthouse's Search button, after the mark), `between` (Drift's smart entries, after the sections), `footer` (sync badge, Settings link, account), `renderSection` (Harbour wraps its Mail and Calendar buttons to take drops), a section with `onSelect` instead of `to` (Lighthouse's buttons), `hoverScope="rail"` (Lighthouse opens the pane from the whole rail), and `markHref` or `onMark`.
 * `RailLink` is one button, for a footer link (Settings) drawn like the sections.
 * Used by: the app shell.
 */
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { LineIcon, type LineName } from '@frameer/icons/LineIcon';
import { AppLink } from './AppLink';
import type { PaneHover } from './usePane';
import { RAIL_BUTTON } from './railStyles';

export const RAIL_ACTIVE = 'bg-[var(--paper)] shadow-[var(--shadow-pill)] hover:bg-[var(--paper)] [--icon-bg:var(--paper)]';

const MARK = 'mb-1.5 flex rounded-[var(--radius-thumb)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] focus-visible:outline-none';

export interface RailSection {
  id: string;
  label: string;
  line: LineName;
  /** The route, drawn as a real link. */
  to?: string;
  /** Without a route: a button that runs this. */
  onSelect?: () => void;
  /** The tooltip; the label when left out. */
  title?: string;
}

/** A section's button: a link when it has a route, a button when it has `onSelect`. */
export function RailLink({ section, active = false, size = 22 }: { section: RailSection; active?: boolean; size?: number }): ReactElement {
  const className = `${RAIL_BUTTON} ${active ? RAIL_ACTIVE : ''}`;
  const icon = <LineIcon name={section.line} size={size} />;
  if (section.to === undefined) {
    return (
      <button type="button" onClick={section.onSelect} aria-label={section.label} title={section.title ?? section.label} aria-current={active ? 'page' : undefined} className={className}>
        {icon}
      </button>
    );
  }
  return (
    <AppLink href={section.to} aria-label={section.label} title={section.title ?? section.label} aria-current={active ? 'page' : undefined} className={className}>
      {icon}
    </AppLink>
  );
}

export interface RailProps {
  /** The app's mark (an SVG component). */
  mark: ReactNode;
  markLabel: string;
  /** The mark is a link to this route. */
  markHref?: string;
  /** Without a route the mark is a button that runs this. */
  onMark?: () => void;
  sections: readonly RailSection[];
  /** The id of the current section; null or undefined when none is (a page outside the sections). */
  activeId?: string | null;
  /** After the mark, before the sections (a Search button). */
  leading?: ReactNode;
  /** After the sections, before the spacer (smart entries). */
  between?: ReactNode;
  /** At the foot (sync badge, Settings, account). */
  footer?: ReactNode;
  /** The nav's accessible name. */
  navLabel?: string;
  /** The pane's pointer handlers: on the sections' nav, or on the whole rail. */
  hover?: PaneHover;
  hoverScope?: 'sections' | 'rail';
  /** Wraps a section's link: Harbour's drop targets. `link` is the default button. */
  renderSection?: (section: RailSection, link: ReactElement, active: boolean) => ReactNode;
  iconSize?: number;
}

export function Rail({ mark, markLabel, markHref, onMark, sections, activeId, leading, between, footer, navLabel = 'Sections', hover, hoverScope = 'sections', renderSection, iconSize = 22 }: RailProps) {
  const rootHover = hoverScope === 'rail' ? hover : undefined;
  const navHover = hoverScope === 'sections' ? hover : undefined;
  return (
    <div
      className="flex w-[62px] flex-shrink-0 flex-col items-center gap-2 overflow-y-auto py-3 [--icon-bg:var(--paper)]"
      data-testid="rail"
      onPointerEnter={rootHover?.onPointerEnter}
      onPointerLeave={rootHover?.onPointerLeave}
    >
      {markHref !== undefined ? (
        <AppLink href={markHref} aria-label={markLabel} className={MARK}>
          {mark}
        </AppLink>
      ) : (
        <button type="button" onClick={onMark} aria-label={markLabel} title={markLabel} className={MARK}>
          {mark}
        </button>
      )}
      {leading}
      <nav aria-label={navLabel} className="flex flex-col items-center gap-2" onPointerEnter={navHover?.onPointerEnter} onPointerLeave={navHover?.onPointerLeave}>
        {sections.map((section) => {
          const active = section.id === activeId;
          const link = <RailLink section={section} active={active} size={iconSize} />;
          return <Fragment key={section.id}>{renderSection ? renderSection(section, link, active) : link}</Fragment>;
        })}
      </nav>
      {between}
      <div className="flex-1" />
      {footer}
    </div>
  );
}
