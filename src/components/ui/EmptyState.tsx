/**
 * @file EmptyState.tsx
 * @description The one empty state every list uses: an illustration (the glass picture of the section for Drive, Photos, Pages, Tasks, Whiteboards and Bases; otherwise a few paths in the muted ink with one accent, gently moving unless motion is reduced), an optional title, the sentence, and an optional action. "An earned moment, not confetti": quiet pictures, no coral (coral marks actions and selection only), no text inside the art.
 * Based on the canvas board "Details" (empty Today, "Clear for today")
 *
 * Three sizes, one look: `full` for a stage, `panel` for a side panel pane (centred in the panel, a mid-size picture) and `compact` for a column, card or strip (the same stack, small, no box; a drop target keeps its own dashed outline for the drop affordance). The picture floats over a breathing shadow and one accent does the section's gesture; the motion plays three cycles and rests, replays when the pointer or focus comes back to it once it has rested, and is still with reduced motion (empty.css).
 * Moved from Drift's items/ui to Frameer so Drift and Yard draw the same one; styles/empty.css holds its motion.
 * Used by: every list, landing, pane and card of Drift and Yard that has nothing to show.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { KIND_ART, type SectionKey } from '@frameer/icons/kinds';
import { SectionPicture } from '@frameer/icons/SectionPicture';

export type EmptyKind = 'folder' | 'search' | 'trash' | 'pages' | 'photos' | 'shared' | 'recent' | 'starred' | 'favorites' | 'activity' | 'clear' | 'tasks' | 'whiteboards' | 'bases';

/** The kinds that are about a section show that section's glass picture instead of a line drawing. */
const SECTION_OF: Partial<Record<EmptyKind, SectionKey>> = { folder: 'drive', pages: 'pages', photos: 'photos', favorites: 'photos', tasks: 'tasks', whiteboards: 'whiteboards', bases: 'bases' };

/** The accent of each picture: the glass kit's own color where the picture is about a type (the same colors the type registry gives them). */
const ACCENTS: Record<EmptyKind, string> = {
  folder: KIND_ART.folder.hue,
  search: 'var(--ink-2)',
  trash: 'var(--ink-2)',
  pages: KIND_ART.page.hue,
  photos: 'var(--ink-2)',
  shared: 'var(--ink-2)',
  recent: 'var(--ink-2)',
  starred: KIND_ART.folder.hue,
  favorites: 'var(--ink-2)',
  activity: 'var(--ink-2)',
  clear: KIND_ART.tasks.hue,
  tasks: KIND_ART.tasks.hue,
  whiteboards: KIND_ART.whiteboard.hue,
  bases: KIND_ART.base.hue,
};

const LINE = { fill: 'none', stroke: 'var(--ink-3)', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const ACCENT = { fill: 'none', stroke: 'var(--empty-accent)', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const TINT = 'color-mix(in srgb, var(--empty-accent) 16%, transparent)';

function Art({ kind }: { kind: EmptyKind }) {
  switch (kind) {
    case 'folder':
      return (
        <>
          <path d="M26 38h22l6 7h40v28a4 4 0 0 1-4 4H30a4 4 0 0 1-4-4z" fill={TINT} stroke="none" />
          <path d="M26 73V34a4 4 0 0 1 4-4h17l6 7h37a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H30a4 4 0 0 1-4-4z" {...LINE} />
          <path d="M48 58h24" {...LINE} strokeDasharray="1 6" />
          <g className="empty-float">
            <path d="M88 20v8M84 24h8" {...ACCENT} />
          </g>
        </>
      );
    case 'search':
      return (
        <>
          <circle cx="54" cy="44" r="20" fill={TINT} stroke="none" />
          <circle cx="54" cy="44" r="20" {...LINE} />
          <path d="M69 59l16 16" {...ACCENT} strokeWidth={2.5} />
          <path d="M46 44h16" {...LINE} strokeDasharray="1 6" />
          <g className="empty-float-late">
            <circle cx="90" cy="26" r="3" {...ACCENT} />
          </g>
        </>
      );
    case 'trash':
      return (
        <>
          <path d="M40 40h40l-3 34a4 4 0 0 1-4 3.5H47a4 4 0 0 1-4-3.5z" fill={TINT} stroke="none" />
          <path d="M40 40h40l-3 34a4 4 0 0 1-4 3.5H47a4 4 0 0 1-4-3.5z" {...LINE} />
          <g className="empty-lift">
            <path d="M35 33h50M54 33v-5h12v5" {...LINE} />
          </g>
          <path d="M53 50v18M67 50v18" {...LINE} strokeDasharray="1 6" />
          <g className="empty-float">
            <path d="M92 28l2 3 3 2-3 2-2 3-2-3-3-2 3-2z" {...ACCENT} strokeWidth={1.5} />
          </g>
        </>
      );
    case 'pages':
      return (
        <>
          <path d="M36 24h34l14 14v40a4 4 0 0 1-4 4H40a4 4 0 0 1-4-4z" fill={TINT} stroke="none" />
          <path d="M36 78V28a4 4 0 0 1 4-4h30l14 14v40a4 4 0 0 1-4 4H40a4 4 0 0 1-4-4z" {...LINE} />
          <path d="M70 24v14h14" {...LINE} />
          <path d="M45 52h30M45 61h30M45 70h18" {...LINE} />
          <g className="empty-float">
            <path d="M82 52l9-9 5 5-9 9-6 1z" {...ACCENT} />
          </g>
        </>
      );
    case 'photos':
      return (
        <>
          <rect x="28" y="30" width="64" height="44" rx="6" fill={TINT} stroke="none" />
          <rect x="28" y="30" width="64" height="44" rx="6" {...LINE} />
          <path d="M28 66l16-16 14 14 10-10 24 22" {...LINE} />
          <g className="empty-pulse">
            <circle cx="76" cy="44" r="5" {...ACCENT} />
          </g>
        </>
      );
    case 'shared':
      return (
        <>
          <circle cx="48" cy="48" r="16" fill={TINT} stroke="none" />
          <circle cx="48" cy="48" r="16" {...LINE} />
          <circle cx="72" cy="48" r="16" {...ACCENT} />
          <path d="M54 48h12" {...LINE} />
          <g className="empty-float">
            <path d="M60 22v7M56.5 25.5h7" {...ACCENT} strokeWidth={1.5} />
          </g>
        </>
      );
    case 'recent':
      return (
        <>
          <circle cx="60" cy="48" r="24" fill={TINT} stroke="none" />
          <circle cx="60" cy="48" r="24" {...LINE} />
          <path d="M60 34v14l9 6" {...ACCENT} />
          <g className="empty-pulse">
            <circle cx="60" cy="48" r="2" {...LINE} />
          </g>
        </>
      );
    case 'starred':
      return (
        <>
          <path d="M60 26l7.2 14.6 16.1 2.3-11.7 11.4 2.8 16-14.4-7.6-14.4 7.6 2.8-16-11.7-11.4 16.1-2.3z" fill={TINT} stroke="none" />
          <path d="M60 26l7.2 14.6 16.1 2.3-11.7 11.4 2.8 16-14.4-7.6-14.4 7.6 2.8-16-11.7-11.4 16.1-2.3z" {...LINE} />
          <g className="empty-float">
            <circle cx="92" cy="30" r="2.5" {...ACCENT} />
          </g>
        </>
      );
    case 'activity':
      return (
        <>
          <rect x="26" y="34" width="68" height="36" rx="8" fill={TINT} stroke="none" />
          <path d="M30 52h14l6-14 10 28 8-20 5 6h17" {...LINE} />
          <g className="empty-pulse">
            <circle cx="92" cy="30" r="3" {...ACCENT} />
          </g>
        </>
      );
    case 'tasks':
    case 'whiteboards':
    case 'bases':
      return null;
    case 'clear':
      return (
        <>
          <circle cx="60" cy="48" r="26" fill={TINT} stroke="none" />
          <circle cx="60" cy="48" r="26" {...LINE} />
          <path d="M48 49l8 8 16-17" {...ACCENT} strokeWidth={2.5} className="empty-draw" />
          <g className="empty-float">
            <path d="M92 24v7M88.5 27.5h7" {...LINE} strokeWidth={1.5} />
          </g>
        </>
      );
  }
}

interface EmptyStateProps {
  kind: EmptyKind;
  /** A short line above the sentence ("Clear for today"). */
  title?: string;
  /** The sentence. */
  children: ReactNode;
  /** Its one action, if it has one. */
  action?: ReactNode;
  testId?: string;
  className?: string;
  /** `full` is for a stage, `panel` for a side panel, `compact` fits a column, a card or a strip. */
  size?: 'full' | 'panel' | 'compact';
}

/** The section pictures' one accent: the section's gesture (a stroke is drawn, a spark twinkles, a row slides in). */
function SectionAccent({ section }: { section: SectionKey }) {
  const common = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (section) {
    case 'tasks':
      return <path d="M5 13l5 5 10-11" {...common} className="empty-draw" />;
    case 'pages':
      return <path d="M4 20l3-1 11-11-2-2L5 17zM14 6l2 2" {...common} />;
    case 'whiteboards':
      return <path d="M3 15c3-8 5 6 8-1s5 3 8-4" {...common} className="empty-draw" />;
    case 'bases':
      return <path d="M4 7h16M4 12h16M4 17h10" {...common} className="empty-draw" />;
    default:
      return <path d="M12 3v6M9 6h6M12 14v7M8.5 17.5h7" {...common} />;
  }
}

/** Three cycles of the slowest motion (empty.css) plus a little; a replay before then would cut the first play short. */
const REST_AFTER_MS = 15000;

export function EmptyState({ kind, title, children, action, testId, className = '', size = 'full' }: EmptyStateProps) {
  // Remounting the picture restarts its CSS animations; with reduced motion there are none, so nothing visibly happens.
  const [plays, setPlays] = useState(0);
  const lastPlay = useRef(0);
  useEffect(() => {
    lastPlay.current = Date.now();
  }, []);
  const replay = () => {
    const now = Date.now();
    if (now - lastPlay.current < REST_AFTER_MS) return;
    lastPlay.current = now;
    setPlays((n) => n + 1);
  };
  const section = SECTION_OF[kind];
  const compact = size === 'compact';
  const panel = size === 'panel';
  const box = compact ? 'flex flex-col items-center gap-2 px-4 py-5 text-center' : panel ? 'flex flex-col items-center justify-center gap-2.5 px-6 py-12 text-center' : 'flex flex-col items-center gap-3 px-6 py-14 text-center';
  const art = compact ? 56 : panel ? 84 : 112;
  return (
    <div data-testid={testId} data-empty-kind={kind} data-empty-size={size} className={`${box} ${className}`} onPointerEnter={replay} onFocus={replay}>
      {section ? (
        <div key={plays} className="relative mb-1 flex-shrink-0" style={{ width: art, height: art }}>
          <div className="empty-float-pic">
            <SectionPicture section={section} size={art} />
          </div>
          <span className="empty-shadow" aria-hidden="true" />
          {kind === 'favorites' ? (
            // Photos are favorited with a heart, never a star: the photos picture carries one that beats.
            <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false" className={`empty-pulse absolute overflow-visible ${compact ? '-right-2 -top-1' : '-right-1 -top-1'}`}>
              <path d="M12 20.5S3.5 15 3.5 8.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 1.9C20.5 15 12 20.5 12 20.5z" fill="var(--paper)" stroke="var(--ink-2)" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width={compact ? 18 : panel ? 24 : 30} height={compact ? 18 : panel ? 24 : 30} aria-hidden="true" focusable="false" className={`empty-accent absolute overflow-visible ${compact ? '-right-2 -top-1' : '-right-1 -top-1'}`}>
              <SectionAccent section={section} />
            </svg>
          )}
        </div>
      ) : (
        <svg key={plays} viewBox="0 0 120 96" width={compact ? 70 : panel ? 96 : 120} height={compact ? 56 : panel ? 77 : 96} aria-hidden="true" focusable="false" style={{ '--empty-accent': ACCENTS[kind] } as CSSProperties} className="overflow-visible">
          <ellipse cx="60" cy="86" rx="30" ry="3.5" fill="var(--paper-3)" />
          <Art kind={kind} />
        </svg>
      )}
      <div className={`flex flex-col gap-1 ${compact ? 'min-w-0' : 'max-w-sm'}`}>
        {title ? <p className={compact || panel ? 'text-[14px] font-semibold text-[var(--ink)]' : 'text-[19px] font-bold text-[var(--ink)]'}>{title}</p> : null}
        <p className={compact || panel ? 'text-[12.5px] text-[var(--ink-2)]' : 'text-sm text-[var(--ink-2)]'}>{children}</p>
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
