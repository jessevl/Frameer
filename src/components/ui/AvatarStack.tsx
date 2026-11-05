/**
 * @file AvatarStack.tsx
 * @description A row of overlapping avatars (overlap 8 px, 2 px paper ring) with a "+N" chip for the rest. Nothing for an empty list. The group is named for assistive technology with the people's names.
 * Based on drift@d91d6950:frontend/src/items/ui/AvatarStack.tsx
 * Used by: apps' bars and rows that show several people.
 */
import React from 'react';
import type { HueName } from '@frameer/lib/hues';
import { Avatar, type AvatarSize } from './Avatar';

export interface StackPerson {
  id: string;
  name: string;
  hue?: HueName;
  src?: string;
}

export interface AvatarStackProps {
  people: StackPerson[];
  /** Names the group for assistive technology, e.g. "People on this page". */
  label: string;
  size?: AvatarSize;
  /** How many avatars show before the rest collapse into "+N" (default 3). */
  max?: number;
  testId?: string;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({ people, label, size = 'md', max = 3, testId }) => {
  if (people.length === 0) return null;
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div role="group" aria-label={`${label}: ${people.map((p) => p.name).join(', ')}`} data-testid={testId} className="flex flex-shrink-0 items-center">
      {shown.map((person, index) => (
        <Avatar key={person.id} name={person.name} hue={person.hue} src={person.src} size={size} ringed className={index > 0 ? '-ml-2' : ''} />
      ))}
      {rest > 0 ? (
        <span
          aria-hidden="true"
          className="-ml-2 box-content flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--paper)] bg-[var(--paper-3)] px-1 text-[10px] font-semibold text-[var(--ink-2)]"
        >
          +{rest}
        </span>
      ) : null}
    </div>
  );
};
