/**
 * @file PillHeader.tsx
 * @description The breadcrumb: flat at the left of the docked bar on desktop (`bar`, no back chevron), a floating pill with a back button on phones (`stretch` fills the row). The last crumb is the current one and names the stage (`id="stage-title"`, `aria-current="page"`); earlier crumbs are links and hide below 640 px.
 * The crumbs are data (`Crumb[]`, the app's `crumbsFor`). Where an app draws more than a label, it says so: `icon` before a label, `count` after it, `renderCrumb` for the whole content of a crumb (Drift's drop target and rename), `renderSeparator` for the chevron (Drift's menu of sibling folders), `trailing` at the end of a phone pill (who has the item open). `titleId={false}` leaves out the stage-title id (Drift names it only on section landings).
 * Needs `@tanstack/react-router` (back, links).
 * Used by: DockedBar (`bar`) and the phone stage.
 */
import type { ReactNode } from 'react';
import { useRouter } from '@tanstack/react-router';
import { ChromeIcon } from '@frameer/components/ui/ChromeIcons';
import { AppLink } from './AppLink';

export interface Crumb {
  key?: string;
  label: string;
  href?: string;
  /** The current crumb; the last one when no crumb says so. */
  current?: boolean;
  icon?: ReactNode;
  count?: ReactNode;
}

export interface CrumbContext {
  index: number;
  first: boolean;
  current: boolean;
  /** The default content of the crumb (link or name), to wrap. */
  content: ReactNode;
}

const FOCUS = 'focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] focus-visible:outline-none';

function Chevron() {
  return <ChromeIcon name="chevronRight" strokeWidth={1.7} aria-hidden="true" className="h-[13px] w-[13px] flex-shrink-0 text-[var(--ink-3)] max-sm:hidden" />;
}

export interface PillHeaderProps {
  crumbs: readonly Crumb[];
  /** Flat in the docked bar (desktop); otherwise a floating pill. */
  bar?: boolean;
  /** Fills the row (phones). */
  stretch?: boolean;
  /** The back button of the phone pill; the browser's Back when left out. */
  onBack?: () => void;
  /** The id `stage-title` goes on the current crumb. */
  titleId?: boolean;
  renderCrumb?: (crumb: Crumb, context: CrumbContext) => ReactNode;
  renderSeparator?: (crumb: Crumb, context: CrumbContext) => ReactNode;
  /** At the end of the phone pill. */
  trailing?: ReactNode;
}

export function PillHeader({ crumbs, bar = false, stretch = false, onBack, titleId = true, renderCrumb, renderSeparator, trailing }: PillHeaderProps) {
  const router = useRouter();
  const lastIndex = crumbs.length - 1;
  const explicit = crumbs.some((crumb) => crumb.current !== undefined);
  return (
    <div
      className={
        bar
          ? 'flex min-w-0 items-center gap-1 pl-2'
          : `${stretch ? 'flex flex-1' : 'inline-flex max-w-full'} h-[46px] min-w-0 items-center gap-1 rounded-full border border-[var(--line-2)] bg-[var(--paper)] pl-[5px] pr-[18px] shadow-[var(--shadow-pill)]`
      }
    >
      {bar ? null : (
        <button
          type="button"
          onClick={onBack ?? (() => router.history.back())}
          aria-label="Back"
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[var(--ink-2)] hover:bg-[var(--hover)] max-md:h-11 max-md:w-11 ${FOCUS}`}
        >
          <ChromeIcon name="chevronLeft" strokeWidth={1.7} aria-hidden="true" className="h-[18px] w-[18px]" />
        </button>
      )}
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[15px]">
          {crumbs.map((crumb, index) => {
            const current = explicit ? crumb.current === true : index === lastIndex;
            const name = (
              <>
                {crumb.icon}
                <span className="truncate">{crumb.label}</span>
              </>
            );
            const content =
              crumb.href && !current ? (
                <AppLink href={crumb.href} className={`flex min-w-0 items-center gap-2 rounded-md px-0.5 text-[var(--ink-2)] hover:text-[var(--ink)] ${FOCUS}`}>
                  {name}
                </AppLink>
              ) : (
                <span id={current && titleId ? 'stage-title' : undefined} aria-current={current ? 'page' : undefined} className={`flex min-w-0 items-center gap-2 px-0.5 ${current ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-2)]'}`}>
                  {name}
                </span>
              );
            const context: CrumbContext = { index, first: index === 0, current, content };
            return (
              <li key={crumb.key ?? crumb.label} className={`flex min-w-0 items-center gap-1.5 ${current ? '' : 'max-sm:hidden'}`}>
                {index > 0 ? (renderSeparator ? renderSeparator(crumb, context) : <Chevron />) : null}
                {renderCrumb ? renderCrumb(crumb, context) : content}
                {crumb.count ? <span className="ml-1 flex-shrink-0 text-[12.5px] font-normal text-[var(--ink-2)] max-sm:hidden">{crumb.count}</span> : null}
              </li>
            );
          })}
        </ol>
      </nav>
      {bar || !trailing ? null : <span className="ml-auto pl-2">{trailing}</span>}
    </div>
  );
}
