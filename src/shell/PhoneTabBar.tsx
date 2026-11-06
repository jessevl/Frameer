/**
 * @file PhoneTabBar.tsx
 * @description The phone navigation: a frosted floating bar with labelled tabs, 66 px high, inset 14 px, 22 px above the bottom edge. The current tab is coral; tapping it again scrolls the stage to the top (`onActiveTap`, `scrollStageToTop` by default). A tab with a route is a link (it works without script and opens in a new tab); one with `onSelect` is a button (Lighthouse); one with `node` is drawn as that node (Drift's Spaces tab with a menu). `create` is the app's create button, placed after `createAt` tabs (the middle by default). The bar hides while the on-screen keyboard is open (`hideOnKeyboard`), and `bottomInset` lifts it above it.
 * Needs the styles in `@frameer/ui/styles/phone.css`.
 * Used by: the app shell's phone layout.
 */
import { Fragment, type ReactNode } from 'react';
import { LineIcon, type LineName } from '@frameer/icons/LineIcon';
import { useKeyboardVisibility } from '@frameer/hooks/useMobileDetection';
import { AppLink } from './AppLink';
import { scrollStageToTop } from './stageScroll';

export interface PhoneTab {
  id: string;
  label: string;
  line?: LineName;
  /** A glyph of the app's own, instead of a line drawing. */
  icon?: ReactNode;
  href?: string;
  onSelect?: () => void;
  /** Drawn as is, in place of the tab. */
  node?: ReactNode;
}

export interface PhoneTabBarProps {
  tabs: readonly PhoneTab[];
  /** The id of the current tab; null when none is (Settings). */
  activeId: string | null;
  /** The create button; the app draws it. */
  create?: ReactNode;
  createAt?: number;
  label?: string;
  /** Runs on every tab press before it navigates (Harbour closes its drawer). */
  onNavigate?: (tab: PhoneTab) => void;
  onActiveTap?: () => void;
  hideOnKeyboard?: boolean;
  /** Pixels above the bottom, for the on-screen keyboard. */
  bottomInset?: number;
}

export function PhoneTabBar({ tabs, activeId, create, createAt, label = 'Sections', onNavigate, onActiveTap = scrollStageToTop, hideOnKeyboard = true, bottomInset = 0 }: PhoneTabBarProps) {
  const { isKeyboardOpen } = useKeyboardVisibility();
  if (hideOnKeyboard && isKeyboardOpen) return null;
  const split = createAt ?? Math.floor(tabs.length / 2);
  return (
    <nav className="fr-tabs" aria-label={label} data-testid="phone-tabs" style={bottomInset ? { bottom: `calc(${bottomInset}px + 22px + var(--safe-area-bottom))` } : undefined}>
      {tabs.map((tab, index) => {
        const on = tab.id === activeId;
        const body = (
          <>
            {tab.icon ?? (tab.line ? <LineIcon name={tab.line} size={22} inherit /> : null)}
            <span>{tab.label}</span>
          </>
        );
        const press = () => onNavigate?.(tab);
        return (
          <Fragment key={tab.id}>
            {create && index === split ? create : null}
            {tab.node !== undefined ? (
              tab.node
            ) : tab.href !== undefined ? (
              <AppLink
                href={tab.href}
                className="fr-tab"
                data-on={on}
                aria-current={on ? 'page' : undefined}
                onClick={(event) => {
                  press();
                  if (on) {
                    event.preventDefault();
                    onActiveTap();
                  }
                }}
              >
                {body}
              </AppLink>
            ) : (
              <button
                type="button"
                className="fr-tab"
                data-on={on}
                aria-current={on ? 'page' : undefined}
                onClick={() => {
                  press();
                  if (on) onActiveTap();
                  else tab.onSelect?.();
                }}
              >
                {body}
              </button>
            )}
          </Fragment>
        );
      })}
      {create && split >= tabs.length ? create : null}
    </nav>
  );
}
