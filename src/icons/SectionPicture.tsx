/**
 * @file SectionPicture.tsx
 * @description The large glass picture of a section (Drive, Photos, Pages, Tasks, Whiteboards, Bases): the stack of cards of the section's type, in the section's own color. Landings and empty states use it; the rail draws the same shapes in Drift line.
 * Used by: the section landings and empty states.
 */
import { GlassIcon } from './GlassIcon';
import { SECTION_ART, type SectionKey } from './kinds';

export function SectionPicture({ section, size = 112, className }: { section: SectionKey; size?: number | null; className?: string }) {
  const art = SECTION_ART[section];
  return <GlassIcon kind={art.kind} layout={art.layout} color={art.hue} size={size} className={className} />;
}
