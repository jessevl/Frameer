/**
 * @file GlassIcon.tsx
 * @description A glass icon: a card of colored glass for one glyph kind (folder, page, task list, PDF ...), drawn from the generator's kit. The color comes from the `--glyph-fg` custom property of the nearest ancestor (ItemGlyph sets it from the registry, the file family or the item's own hue), so one drawing follows the item's color and the theme. A custom Lucide icon (loaded on demand, so the catalogue stays out of the entry chunk) or emoji replaces the marks on the card, inside the folder's pocket so it tips with it. At 32 px and below the small drawing is used. Gradient and filter ids carry a per-instance prefix.
 * Used by: ItemGlyph, SectionPicture.
 */
import { createElement, useId, useMemo, type CSSProperties } from 'react';
import { isLucideName, lucideIconByName, useLucideCatalogue } from '@frameer/lib/lucideCatalogue';
import { customMarkBox, groupTransform, isSmall, kindParts } from './draw';
import { defs, type Layout } from './glass';
import { KIND_ART, type KindKey } from './kinds';
import { paletteOf } from './palette';


/** Placeholder for the instance prefix inside cached markup. */
const SLOT = '@@';

interface Built {
  defs: string;
  before: string;
  pocket: boolean;
  front: string;
  marks: string;
}

const cache = new Map<string, Built>();

/** Markup for a kind at a drawing size, built once per variant and given its prefix at render. */
function build(kind: KindKey, small: boolean, layout: Layout | null, base: string): Built {
  const key = `${kind}|${small}|${layout}|${base}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = paletteOf(base);
  const parts = kindParts(kind, SLOT, c, small, layout);
  // No whitespace between elements: the markup must add nothing to the text of the row around it.
  const flat = (markup: string) => markup.replace(/\n\s*/g, '');
  const built = { defs: flat(defs(SLOT, c)), before: flat(parts.before), pocket: parts.pocket, front: flat(parts.front), marks: flat(parts.marks) };
  cache.set(key, built);
  return built;
}

const withPrefix = (markup: string, p: string) => markup.replaceAll(SLOT, p);

function CustomMark({ kind, icon, small, p }: { kind: KindKey; icon: string; small: boolean; p: string }) {
  const { cx, cy, scale, strokeWidth } = customMarkBox(kind, small);
  // The catalogue loads on demand (Frameer's lucideCatalogue), and only for a Lucide name: an emoji never needs it. Until it is in, the card shows without a mark.
  const named = isLucideName(icon);
  const found = lucideIconByName(useLucideCatalogue(named), icon);
  if (!found) {
    if (named) return null;
    // An emoji (or any text) set as the item's icon.
    return (
      <text x={cx} y={cy} fontSize={Math.round(24 * scale * 0.82)} textAnchor="middle" dominantBaseline="central">
        {icon}
      </text>
    );
  }
  const side = 24 * scale;
  return createElement(found, { x: cx - side / 2, y: cy - side / 2, width: side, height: side, strokeWidth, stroke: `url(#${p}ink24)`, fill: 'none' });
}

export interface GlassIconProps {
  kind: KindKey;
  /** Pixel size of the square box; null lets CSS size it. */
  size: number | null;
  /** The sheets behind the card (section pictures, page folders). */
  layout?: Layout | null;
  /** The color the glass derives from; defaults to `--glyph-fg`, falling back to the kind's own color. */
  color?: string;
  /** A Lucide icon name (`Plane`) or an emoji, shown in place of the card's marks. */
  custom?: string;
  /** Spoken name; leave out where the name is next to the icon. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function GlassIcon({ kind, size, layout = null, color, custom = '', label, className, style }: GlassIconProps) {
  const p = `gi${useId().replace(/[^a-zA-Z0-9]/g, '')}_`;
  const small = isSmall(size);
  const base = color ?? `var(--glyph-fg, ${KIND_ART[kind].hue})`;
  const built = useMemo(() => build(kind, small, layout, base), [kind, small, layout, base]);
  const front = withPrefix(custom ? built.front : built.front + built.marks, p);
  const mark = custom ? <CustomMark kind={kind} icon={custom} small={small} p={p} /> : null;
  return (
    <svg
      viewBox="0 0 512 512"
      width={size ?? undefined}
      height={size ?? undefined}
      fill="none"
      className={`gi-glass${className ? ` ${className}` : ''}`}
      style={style}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: false })}
    >
      <g dangerouslySetInnerHTML={{ __html: withPrefix(built.defs, p) }} />
      <g transform={groupTransform(small)} filter={`url(#${p}shadow)`}>
        <g dangerouslySetInnerHTML={{ __html: withPrefix(built.before, p) }} />
        {built.pocket ? (
          <g className="gi-pocket">
            <g dangerouslySetInnerHTML={{ __html: front }} />
            {mark}
          </g>
        ) : (
          <>
            <g dangerouslySetInnerHTML={{ __html: front }} />
            {mark}
          </>
        )}
      </g>
    </svg>
  );
}
