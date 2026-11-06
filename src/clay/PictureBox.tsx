/**
 * @file PictureBox.tsx
 * @description The sized box a picture lives in. It renders before the picture's lazy chunk arrives, so the layout never jumps. A box with a `label` is the picture of a whole screen (`role="img"`); every other box is decoration (`aria-hidden`) and its words sit beside it in the page. This file imports nothing from the clay kit, so it can sit in an entry or feature chunk while the pictures load later; import it as `@frameer/clay/PictureBox`, not from the clay barrel.
 * @app SHARED - Generic: knows nothing about any app's scenes.
 * Ported from drift@frontend/src/items/pictures/LazyPictures.tsx (Box) and yard@frontend/src/pictures/kit/PictureBox.tsx.
 * Used by: every app's lazy picture wrappers.
 */
import React, { lazy, Suspense, type ComponentType, type CSSProperties, type ReactNode } from 'react';

export interface PictureBoxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'role' | 'aria-label' | 'aria-hidden'> {
  /** Words for a picture that stands for a whole screen; the box then is `role="img"`. Leave out for decoration. */
  label?: string;
  className?: string;
  style?: CSSProperties;
  /** The lazy picture (made with `lazyPicture`); the box shows nothing until it has loaded. */
  children?: ReactNode;
  /** `data-*` attributes and other div props (`id`, `onClick`, ...) pass through to the box. */
}

/** A box that holds its size while a lazy picture loads. */
export const PictureBox: React.FC<PictureBoxProps> = ({ label, className, style, children, ...rest }) => {
  const a11y = label ? ({ role: 'img', 'aria-label': label } as const) : ({ 'aria-hidden': true } as const);
  return (
    <div {...rest} {...a11y} className={className} style={style}>
      <Suspense fallback={null}>{children}</Suspense>
    </div>
  );
};

/** A scene's canvas as a lazy component: `lazyPicture(() => import('./SceneCanvas'))` (a default export). */
export function lazyPicture<P extends object>(load: () => Promise<{ default: ComponentType<P> }>): ComponentType<P>;
/** A named export as a lazy component, props inferred: `lazyPicture(() => import('./Scenes'), 'Harbour')`. */
export function lazyPicture<M extends Record<string, unknown>, K extends keyof M & string>(
  load: () => Promise<M>,
  name: K,
): M[K] extends ComponentType<infer P> ? ComponentType<P> : never;
export function lazyPicture(load: () => Promise<Record<string, unknown>>, name = 'default'): unknown {
  // The overloads fix the exported type; this body only picks the export, so it returns unknown (every overload's type is assignable to it).
  return lazy(async () => ({ default: (await load())[name] as ComponentType<object> }));
}
