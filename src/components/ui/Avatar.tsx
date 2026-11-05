/**
 * @file Avatar.tsx
 * @description A person's avatar: a picture when `src` is given, else the initials on the person's hue, or a quiet person glyph (never a question mark) when the name is not known. The hue is the caller's choice (apps pick it from a person's id or settings), so one person looks the same everywhere. Decorative by default, since the name is read next to it; pass `label` where it stands alone.
 * Based on drift@d91d6950:frontend/src/items/ui/Avatar.tsx (the app-side color pick and `userId` became the `hue` prop)
 * Used by: AvatarStack, the `choices` item of the context menu, apps' people rows and bars.
 */
import React from 'react';
import { cn } from '@frameer/lib/design-system';
import { hueVar, type HueName } from '@frameer/lib/hues';
import { ChromeIcon } from './ChromeIcons';

export type AvatarSize = 'sm' | 'md' | 'lg';

const SIZES: Record<AvatarSize, string> = { sm: 'h-5 w-5 text-[9.5px]', md: 'h-6 w-6 text-[10px]', lg: 'h-7 w-7 text-[11px]' };

export interface AvatarProps {
  name: string;
  /** The letters to show when they should not be taken from the name ("MV" for a first name that is two words). */
  initials?: string;
  /** The person's hue; without one the avatar is the quiet grey. */
  hue?: HueName;
  /** A picture of the person; it replaces the initials. */
  src?: string;
  size?: AvatarSize;
  /** A 2 px ring in the paper color, so overlapping avatars stay apart. */
  ringed?: boolean;
  /** Makes the avatar an image with this accessible name. */
  label?: string;
  className?: string;
}

/** "Mara Vos" is "MV", "mara" is "M", and nobody is "?". Empty for an empty name. */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter((part) => part !== '')
    .map((part) => Array.from(part)[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({ name, initials: given, hue, src, size = 'md', ringed = false, label, className }) => {
  const initials = given ?? initialsOf(name);
  const unknown = initials === '';
  const style = !src && !unknown && hue ? { background: hueVar(hue, 'fill'), color: hueVar(hue, 'ink') } : undefined;
  return (
    <span
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-avatar=""
      title={unknown ? undefined : name}
      style={style}
      className={cn(
        'flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold',
        SIZES[size],
        !style && 'bg-[var(--paper-3)] text-[var(--ink-2)]',
        ringed && 'box-content border-2 border-[var(--paper)]',
        className,
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : unknown ? (
        <ChromeIcon name="user" className="h-[60%] w-[60%]" strokeWidth={1.8} aria-hidden="true" />
      ) : (
        initials
      )}
    </span>
  );
};
