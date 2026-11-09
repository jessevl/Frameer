/**
 * @file GlyphTile.tsx
 * @description A paper tile with a hairline and the card shadow around a neutral ink-2 icon (30, 40 or 52 px). Decoration: the row beside it names the thing. IconWrapper is a large tinted tile for empty states; this is the row icon.
 * Used by: list rows.
 */
import type { ReactNode } from 'react';

export type GlyphSize = 30 | 40 | 52;

export function GlyphTile({ size = 40, children }: { size?: GlyphSize; children: ReactNode }) {
  return (
    <span className="fr-glyph" data-size={size} aria-hidden="true">
      {children}
    </span>
  );
}
