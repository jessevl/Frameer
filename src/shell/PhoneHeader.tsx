/**
 * @file PhoneHeader.tsx
 * @description The phone header: a row with the app's mark (or a back button, which can carry the parent's name), a compact title pill that fades in as the list scrolls, optional `actions`, and one tools pill (`tools`: `PhoneTool` buttons); under it the large title with an optional subtitle. Scrolling the stage collapses the large title (`useLargeTitleScroll`).
 * Per-app differences are props: `largeTitle` (off for a screen with its own heading), `compact` (keeps the compact pill showing and hides the large title: Lighthouse), `center` (replaces the compact pill and stays visible), `decorative` (the large title is an aria-hidden `h2`, as Drift's, because the page has its own heading), `headingId` (`stage-title` by default), `onSubtitle` (the subtitle opens something and is drawn as a button), `scrollKey` (the route; restarts the scroll tracking).
 * Needs the styles in `@frameer/ui/styles/phone.css`.
 * Used by: the app shell's phone layout.
 */
import { useRef, type ReactNode } from 'react';
import { ChromeIcon } from '@frameer/components/ui/ChromeIcons';
import { AppLink } from './AppLink';
import { useLargeTitleScroll } from './largeTitle';

export interface PhoneBack {
  /** The button's accessible name ("Back to Inbox"). */
  label: string;
  /** The parent's name, drawn beside the arrow; an arrow alone when left out. */
  name?: string;
  onClick: () => void;
}

export interface PhoneHeaderProps {
  title: string;
  subtitle?: string;
  onSubtitle?: () => void;
  /** The mark at the row's start; replaced by `back` on a nested page. */
  leading?: ReactNode;
  back?: PhoneBack;
  actions?: ReactNode;
  /** The contents of the tools pill; no pill when left out. */
  tools?: ReactNode;
  center?: ReactNode;
  compact?: boolean;
  largeTitle?: boolean;
  decorative?: boolean;
  headingId?: string;
  scrollKey?: string;
  /** The stage's selector, the closest element that holds the header. */
  scrollRoot?: string;
}

export function PhoneHeader({ title, subtitle, onSubtitle, leading, back, actions, tools, center, compact = false, largeTitle = true, decorative = false, headingId = 'stage-title', scrollKey = '', scrollRoot = 'main' }: PhoneHeaderProps) {
  const ref = useRef<HTMLElement>(null);
  const large = largeTitle && !compact;
  useLargeTitleScroll(ref, large, scrollKey, scrollRoot);
  const Heading = decorative ? 'h2' : 'h1';
  return (
    <>
      <header ref={ref} className="fr-phead" data-mobile-head data-testid="phone-header">
        <div className="fr-phead-row">
          {back ? (
            <button type="button" className="fr-pb" data-named={back.name ? '' : undefined} onClick={back.onClick} aria-label={back.label}>
              <ChromeIcon name="chevronLeft" aria-hidden="true" className="h-[19px] w-[19px] flex-none" />
              {back.name ? <span className="fr-pb-name">{back.name}</span> : null}
            </button>
          ) : (
            leading
          )}
          {center ?? (
            <span className="fr-phead-title" aria-hidden="true" data-compact={compact ? 'true' : undefined}>
              {title}
            </span>
          )}
          {actions}
          {tools ? (
            <div role="toolbar" aria-label="Tools" className="fr-ptools">
              {tools}
            </div>
          ) : null}
        </div>
      </header>
      {large ? (
        <div className="fr-lt" data-testid="large-title" style={{ ['--lt-h' as string]: subtitle ? '76px' : '46px' }}>
          <Heading id={decorative ? undefined : headingId} aria-hidden={decorative || undefined}>
            {title}
          </Heading>
          {subtitle && onSubtitle ? (
            <button type="button" className="fr-lt-sub" aria-haspopup="dialog" aria-label={`${title}: ${subtitle}`} onClick={onSubtitle}>
              {subtitle}
              <ChromeIcon name="chevronDown" aria-hidden="true" className="h-3 w-3" />
            </button>
          ) : subtitle ? (
            <span className="fr-lt-sub" data-quiet>{subtitle}</span>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

/** One button of the tools pill, 44 px: a link with `href`, else a button. `label` is its name; the icon is the children. */
export function PhoneTool({ label, onClick, href, children, ...rest }: { label: string; onClick?: () => void; href?: string; children: ReactNode; 'aria-haspopup'?: 'dialog' | 'menu'; 'aria-expanded'?: boolean }) {
  if (href !== undefined) {
    return (
      <AppLink href={href} className="fr-pt" aria-label={label}>
        {children}
      </AppLink>
    );
  }
  return (
    <button type="button" className="fr-pt" onClick={onClick} aria-label={label} {...rest}>
      {children}
    </button>
  );
}
