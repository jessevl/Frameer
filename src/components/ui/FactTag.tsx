/**
 * @file FactTag.tsx
 * @description An outline pill for a short fact such as "ext4" or "USB". Badge is a tinted, blurred state chip; this is the quiet hairline pill beside a name.
 * Used by: list rows and detail headers.
 */
import type { ReactNode } from 'react';

export function FactTag({ children }: { children: ReactNode }) {
  return <span className="fr-fact-tag">{children}</span>;
}
