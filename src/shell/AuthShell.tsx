/**
 * @file AuthShell.tsx
 * @description The frame of every signed-out screen (sign-in, first-run claim, invitation, password reset): a form column with the app's brand at the top, a status chip naming this server, a title and subtitle, the form, and a footnote, and beside it a slot for the art. Three layouts. `split` (default): the column on the left and the art filling the right on wide screens. `window`: the same inside one rounded window on the canvas, the art hidden below 1024 px. `card`: the brand above one dialog card, no art. The brand, the chip's words, the footnote and the art are the app's; the layout, the heading order and the server chip are here. `card` with `bare` renders the children directly in the frame. Also `ServerStatusChip`, `FormError` (no outer margin) and `AuthArt` (a coral field with floating tiles and a picture; `tilesAbove` puts the tiles over the picture). Import `@frameer/styles/signin.css` once for the art's motion.
 * Every layout scrolls itself (`Scroller`): base.css turns off page scrolling for the app shell, so a frame that only
 * grows the page would cut off a long form (a setup wizard on a laptop screen) for anyone without a Tab key.
 * @app SHARED - Generic: knows nothing about any app's brand or server.
 * Ported from drift@frontend/src/features/auth/AuthShell.tsx, lighthouse@frontend/src/components/auth/AuthShell.tsx and yard@frontend/src/ui/AuthFrame.tsx.
 * Used by: the apps' sign-in, claim, invitation and reset routes.
 */
import React, { type CSSProperties } from 'react';
import { cn } from '@frameer/lib/design-system';
import { hueVar, type HueName } from '@frameer/lib/hues';
import { ChromeIcon } from '../components/ui/ChromeIcons';

export interface AuthShellProps {
  /** `split` (default), `window` or `card`. */
  variant?: 'split' | 'window' | 'card';
  /** The mark and wordmark at the top of the column. */
  brand: React.ReactNode;
  /** Under the brand: usually a `ServerStatusChip`. */
  status?: React.ReactNode;
  title: string;
  subtitle?: string;
  /** The form. */
  children: React.ReactNode;
  /** A line at the foot of the column ("Your files stay on this server."). Not shown in the `card` layout. */
  footnote?: React.ReactNode;
  /** The art beside the column (an `AuthArt`, or the app's own). It must hide itself from assistive technology. Not shown in the `card` layout. */
  art?: React.ReactNode;
  /** In the `card` layout: let the card be 1040 px wide with its children side by side. */
  wide?: boolean;
  /** In the `card` layout: no heading and no padding; the children fill the frame as they are (a side-by-side wizard brings its own columns and heading). */
  bare?: boolean;
}

const Heading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="flex flex-col gap-1.5">
    <h1 className="m-0 text-4xl font-bold tracking-[-0.03em] text-[var(--ink)]">{title}</h1>
    {subtitle ? <p className="m-0 text-[15px] text-[var(--ink-2)]">{subtitle}</p> : null}
  </div>
);

/** The window-high scroll box around each layout; the layouts inside keep their own `min-h-dvh`. */
const Scroller: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-testid="auth-scroll" className="h-dvh overflow-y-auto overscroll-contain">
    {children}
  </div>
);

/** The frame of the signed-out screens. */
export const AuthShell: React.FC<AuthShellProps> = ({ variant = 'split', brand, status, title, subtitle, children, footnote, art, wide = false, bare = false }) => {
  if (variant === 'card') {
    return (
      <Scroller>
        <div className="flex min-h-dvh flex-col items-center gap-7 bg-[var(--canvas)] px-4 py-10 sm:px-6">
          <div className="flex items-center gap-3">{brand}</div>
          <main
            className={cn(
              'flex w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--paper)] shadow-[var(--shadow-pill)]',
              wide ? 'max-w-[1040px] flex-row flex-wrap' : 'max-w-[440px] flex-col',
            )}
          >
            {bare ? (
              children
            ) : (
              <div className="flex flex-1 flex-col gap-5 p-6 sm:p-8">
                {status}
                <Heading title={title} subtitle={subtitle} />
                <div>{children}</div>
              </div>
            )}
          </main>
        </div>
      </Scroller>
    );
  }
  const column = (
    <section
      className={cn(
        'flex w-full flex-col px-6 py-10 sm:px-12',
        variant === 'split' ? 'lg:w-[620px] lg:flex-none lg:px-20 lg:py-12' : 'justify-center gap-4 lg:px-16 lg:py-14',
      )}
    >
      <div className="flex items-center gap-2.5">{brand}</div>
      <div className={cn('flex max-w-[400px] flex-col gap-5', variant === 'split' ? 'flex-1 justify-center py-8' : 'py-4')}>
        {status}
        <Heading title={title} subtitle={subtitle} />
        <div>{children}</div>
      </div>
      {footnote ? <p className="m-0 text-[12.5px] text-[var(--ink-2)]">{footnote}</p> : null}
    </section>
  );
  if (variant === 'window') {
    return (
      <Scroller>
        <main className="grid min-h-dvh place-items-center bg-[var(--canvas)] p-0 text-[var(--ink)] lg:p-10">
          <div className="grid w-full max-w-[1360px] grid-cols-1 overflow-hidden bg-[var(--paper)] lg:min-h-[calc(100dvh-80px)] lg:grid-cols-[520px_minmax(0,1fr)] lg:rounded-[26px] lg:border lg:border-[var(--line-2)] lg:shadow-[var(--shadow-pill)]">
            {column}
            {art}
          </div>
        </main>
      </Scroller>
    );
  }
  return (
    <Scroller>
      <main className="flex min-h-dvh bg-[var(--paper)]">
        {column}
        {art}
      </main>
    </Scroller>
  );
};

/** The chip under the brand: a dot (green when the server answered) and the server's words ("harbour.home · online · v0.0.1"). */
export const ServerStatusChip: React.FC<{ online: boolean; children: React.ReactNode; className?: string }> = ({ online, children, className }) => (
  <span
    data-testid="server-status"
    className={cn('inline-flex h-[30px] items-center gap-2 self-start rounded-full border border-[var(--line)] bg-[var(--paper-2)] px-3 font-mono text-xs text-[var(--ink-2)]', className)}
  >
    <span aria-hidden="true" className={cn('h-[7px] w-[7px] rounded-full', online ? 'bg-[var(--hue-green-stroke)]' : 'bg-[var(--ink-3)]')} />
    {children}
  </span>
);

/** The server's answer when a form failed, as it came. The words are in ink (the danger red on its fill is just under 4.5:1 in the light theme); nothing renders without a message. It has no outer margin: the caller spaces it (`className="mb-4"`). */
export const FormError: React.FC<{ message: string | null; className?: string }> = ({ message, className }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn('flex items-start gap-2.5 rounded-[var(--radius-tree)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--ink)]', className)}
    >
      <span className="mt-0.5 flex-shrink-0 text-[var(--color-danger-fg)]">
        <ChromeIcon name="alertTriangle" className="h-4 w-4" aria-hidden="true" />
      </span>
      <span>{message}</span>
    </div>
  );
};

/** One floating piece of the art. Give `hue` for an outline tile in that hue, or `node` for your own picture (a clay jar). */
export interface AuthTile {
  x: string;
  y: string;
  size: number;
  rotate: number;
  /** Seconds before this tile starts to float, so neighbours stay out of step. */
  delay: number;
  hue?: HueName;
  node?: React.ReactNode;
}

const AuthTileShape: React.FC<{ tile: AuthTile; above: boolean }> = ({ tile, above }) => {
  const stroke = tile.hue ? hueVar(tile.hue, 'stroke') : undefined;
  const style = {
    left: tile.x,
    top: tile.y,
    width: tile.size,
    height: tile.size,
    '--tile-rotate': `${tile.rotate}deg`,
    '--tile-delay': `${tile.delay}s`,
    ...(above ? { zIndex: 2 } : {}),
    ...(stroke ? { borderRadius: Math.round(tile.size * 0.26), border: `2.5px solid ${stroke}` } : {}),
  } as CSSProperties;
  return (
    <div className={cn('signin-tile absolute box-border', stroke ? 'overflow-hidden bg-[var(--paper)]/75 shadow-[var(--shadow-pill)]' : '')} style={style}>
      {stroke ? (
        <span className="absolute left-[22%] right-[30%] top-[40%] h-[2.5px] rounded-sm" style={{ background: stroke, boxShadow: `0 ${Math.round(tile.size * 0.16)}px 0 ${stroke}` }} />
      ) : (
        tile.node
      )}
    </div>
  );
};

export interface AuthArtProps {
  /** The floating tiles behind the picture. */
  tiles?: readonly AuthTile[];
  /** The picture, centred (a clay scene, a large mark). */
  children?: React.ReactNode;
  /** The line under the picture. */
  caption?: React.ReactNode;
  /** Draw the tiles over the picture instead of behind it. */
  tilesAbove?: boolean;
}

/** A soft coral field with floating tiles and a centred picture: the right half of the sign-in screen. Decorative, so it is hidden from assistive technology and from screens under 1024 px. */
export const AuthArt: React.FC<AuthArtProps> = ({ tiles = [], children, caption, tilesAbove = false }) => (
  <div
    aria-hidden="true"
    data-auth-art
    className="relative m-3 hidden flex-1 overflow-hidden rounded-[28px] lg:block"
    style={{ background: 'linear-gradient(150deg, color-mix(in oklab, var(--coral) 12%, var(--paper)) 0%, color-mix(in oklab, var(--coral) 28%, var(--paper)) 45%, color-mix(in oklab, var(--coral) 55%, var(--paper)) 100%)' }}
  >
    {tiles.map((tile, index) => (
      <AuthTileShape key={tile.hue ?? index} tile={tile} above={tilesAbove} />
    ))}
    {children ? <div className="absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2">{children}</div> : null}
    {caption ? <p className="absolute inset-x-0 bottom-12 m-0 text-center text-lg font-semibold tracking-tight text-[var(--ink)]">{caption}</p> : null}
  </div>
);
