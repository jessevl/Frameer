/**
 * @file AuthParts.tsx
 * @description The parts every suite sign-in screen shares, so the six apps look and read the same (Drift's screen is the model): `AuthBrand` (the app's mark at 34 px and its name), `AuthMarkTile` (the large mark, white with a coral edge, in a coral square at the centre of `AuthArt`, moving on its own in the app's one gesture), `AuthEmailInput` ("Email address", you@example.com), `KeepSignedIn` (the checkbox under the password), `AuthHint` (a centred line under the button: who to ask, a link) and `serverStatusLine` (the server chip's words: "drift.home · online · v0.9").
 * @app SHARED - Generic: the app is named by its suite mark id; its words (name, captions, hints) are props.
 * Ported from drift@b9fe5ae1:frontend/src/features/auth/DriftAuthShell.tsx, LoginForm.tsx, SignInArt.tsx and serverStatus.ts.
 * Used by: the apps' sign-in, claim and invitation screens, inside AuthShell.
 */
import React, { useId, useMemo } from 'react';
import { cn } from '@frameer/lib/design-system';
import Input from '../components/ui/Input';
import { suiteMarkSvg, type SuiteApp } from '../icons/suiteMark';

function useMark(app: SuiteApp, variant: 'full' | 'paper', size: number): string {
  const prefix = `am${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return useMemo(() => suiteMarkSvg(app, variant, prefix, { size, label: '' }), [app, variant, prefix, size]);
}

/** The top of the form column: the app's glass mark at 34 px and its name. Give it to AuthShell's `brand`. */
export const AuthBrand: React.FC<{ app: SuiteApp; name: string }> = ({ app, name }) => {
  const svg = useMark(app, 'full', 34);
  return (
    <>
      <span aria-hidden="true" className="block h-[34px] w-[34px] flex-none" dangerouslySetInnerHTML={{ __html: svg }} />
      <span className="text-[22px] font-semibold tracking-[-0.045em] text-[var(--ink)]">{name}</span>
    </>
  );
};

/** The centre of the sign-in art: the app's mark (white card, coral edge) at 190 px in a 260 px coral square, its moving part going on its own (suite-mark.css; still with reduced motion). Put it inside AuthArt. */
export const AuthMarkTile: React.FC<{ app: SuiteApp; className?: string }> = ({ app, className }) => {
  const svg = useMark(app, 'paper', 190);
  return (
    <div data-testid="auth-mark-tile" className={cn('flex h-[260px] w-[260px] items-center justify-center rounded-[78px] bg-[var(--coral)] shadow-[var(--shadow-float)]', className)}>
      <span data-working="true" className="block h-[190px] w-[190px]" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
};

/** The sign-in e-mail field: "Email address", a you@example.com placeholder, no capitals or corrections. */
export const AuthEmailInput: React.FC<{ value: string; onChange: (value: string) => void; autoFocus?: boolean; label?: string }> = ({ value, onChange, autoFocus = true, label = 'Email address' }) => (
  <Input
    type="email"
    label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="you@example.com"
    autoCapitalize="none"
    autoCorrect="off"
    autoComplete="email"
    inputMode="email"
    spellCheck={false}
    required
    autoFocus={autoFocus}
  />
);

/** "Keep me signed in": checked, the session outlives the browser; unchecked, it ends when the tab or window closes (the app keeps its token in sessionStorage). */
export const KeepSignedIn: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-[var(--ink-2)]">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--coral-ink)]" />
    Keep me signed in
  </label>
);

/** A centred line under the button. `small` for the quiet note ("Forgot your password? …"), the default size for a line with a link. */
export const AuthHint: React.FC<{ children: React.ReactNode; small?: boolean }> = ({ children, small = false }) => (
  <p className={cn('text-center text-[var(--ink-2)]', small ? 'text-xs' : 'text-sm')}>{children}</p>
);

/** A link-styled button for an AuthHint ("Ask for an invite"). */
export const AuthLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="font-medium text-[var(--coral-ink)] hover:underline">
    {children}
  </button>
);

export interface ServerStatusInput {
  /** The server's name, or the page's host name. */
  name: string;
  version: string;
  loading: boolean;
  failed: boolean;
}

/** The chip's words from what the server reported: "drift.home · online · v0.9", "drift.home · checking…" while the first answer is pending, "drift.home · offline" when it failed. */
export function serverStatusLine({ name, version, loading, failed }: ServerStatusInput): { text: string; online: boolean } {
  if (failed) return { text: `${name} · offline`, online: false };
  if (loading) return { text: `${name} · checking…`, online: false };
  const shown = /^\d/.test(version) ? `v${version}` : version;
  return { text: [name, 'online', shown].filter(Boolean).join(' · '), online: true };
}
