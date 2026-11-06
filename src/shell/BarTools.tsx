/**
 * @file BarTools.tsx
 * @description The stage's tools in the docked bar: the tools the current view registered (`useStageTools`), drawn as icon buttons, pills, a coral add button, a slider, or one segmented switch for neighbours that share a `section`; then the side panel toggle. `leading` sits before the tools, `trailing` after them; `panelToggle` is the toggle itself (`<PanelToggle open onToggle />`), left out while the panel is open (it then lives above the panel, in DockedBar) or on screens without a panel. A tool with `node` is drawn as that node.
 * Used by: the docked bar.
 */
import type { ReactNode } from 'react';
import { LineIcon } from '@frameer/icons/LineIcon';
import { ChromeIcon } from '@frameer/components/ui/ChromeIcons';
import { anchorOf, useRegisteredStageTools, type StageTool } from './stageTools';

const FOCUS = 'focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] focus-visible:outline-none';
const ICON_BUTTON = `relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-tree)] text-[var(--ink-2)] hover:bg-[var(--hover)] hover:text-[var(--ink)] ${FOCUS}`;
const ON = 'bg-[var(--active)] text-[var(--ink)]';

/** An add action: a coral labelled button, with a chevron when it has a menu of more things to add. */
function AddButton({ tool }: { tool: StageTool }) {
  const { split } = tool;
  return (
    <div className="mr-1 flex h-[var(--toolbar-btn)] items-stretch rounded-full bg-[var(--coral-strong)] text-[var(--color-button-primary-text)]">
      <button
        type="button"
        onClick={(event) => tool.onClick(anchorOf(event.currentTarget))}
        aria-label={tool.label}
        data-motion={tool.motion}
        className={`flex items-center gap-1.5 pl-3 text-[13px] font-medium hover:brightness-105 ${FOCUS} ${split ? 'rounded-l-full pr-2.5' : 'rounded-full pr-3.5'}`}
      >
        {/* One icon per button: the plus says "add"; the label says what. */}
        <LineIcon name={tool.line ?? 'newon'} size={18} />
        <span>{tool.text}</span>
      </button>
      {split ? (
        <button
          type="button"
          onClick={(event) => split.onClick(anchorOf(event.currentTarget))}
          aria-label={split.label}
          aria-haspopup="menu"
          aria-expanded={split.open ?? false}
          className={`flex w-8 items-center justify-center rounded-r-full border-l border-white/30 hover:brightness-105 ${FOCUS}`}
        >
          <ChromeIcon name="chevronDown" className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

const TILE = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' } as const;

/** A stepped size control drawn with tile glyphs: small tiles at one end, large ones at the other. */
function SliderTool({ tool, slider }: { tool: StageTool; slider: NonNullable<StageTool['slider']> }) {
  return (
    <label className="mr-1 flex h-[var(--toolbar-btn)] items-center gap-2 rounded-full bg-[var(--paper-3)] px-2.5 text-[var(--ink-2)]">
      <svg aria-hidden="true" {...TILE} className="h-3.5 w-3.5 flex-none">
        <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
        <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      </svg>
      <input
        type="range"
        min={0}
        max={slider.steps - 1}
        step={1}
        value={slider.value}
        onChange={(event) => slider.onChange(Number(event.target.value))}
        aria-label={tool.label}
        className={`h-1 w-[72px] cursor-pointer accent-[var(--ink-2)] ${FOCUS}`}
      />
      <svg aria-hidden="true" {...TILE} className="h-3.5 w-3.5 flex-none">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
      </svg>
    </label>
  );
}

function PillTool({ tool }: { tool: StageTool }) {
  const Icon = tool.icon;
  return (
    <button
      type="button"
      onClick={(event) => tool.onClick(anchorOf(event.currentTarget))}
      aria-pressed={tool.active}
      data-motion={tool.motion}
      className={`relative mr-1 flex h-[var(--toolbar-btn)] flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium ${FOCUS} ${
        tool.primary ? 'bg-[var(--coral-strong)] text-[var(--color-button-primary-text)] hover:brightness-105' : `border border-[var(--line-2)] text-[var(--ink)] hover:bg-[var(--hover)] ${tool.active ? 'bg-[var(--active)]' : ''}`
      }`}
    >
      {tool.line ? <LineIcon name={tool.line} size={18} inherit /> : null}
      {tool.pillIcon && Icon ? <Icon className="h-4 w-4 text-[var(--ink-2)]" strokeWidth={1.7} aria-hidden="true" /> : null}
      {tool.label}
      {tool.value ? <span className="font-normal text-[var(--ink-2)] sr-only @[960px]/bar:not-sr-only">{tool.value}</span> : null}
      {tool.count ? (
        tool.countBadge ? (
          <span aria-label={`${tool.count} applied`} className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--coral-strong)] px-1 text-[11px] font-semibold text-[var(--color-button-primary-text)]">
            {tool.count}
          </span>
        ) : (
          <span className="text-[12px] font-normal tabular-nums text-[var(--ink-2)]">{tool.count}</span>
        )
      ) : null}
      {tool.dot ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--coral)]" /> : null}
    </button>
  );
}

function ToolButton({ tool }: { tool: StageTool }) {
  const Icon = tool.icon;
  if (tool.node !== undefined) return <span className="flex items-center">{tool.node}</span>;
  if (tool.slider) return <SliderTool tool={tool} slider={tool.slider} />;
  if (tool.text) return <AddButton tool={tool} />;
  if (tool.pill || tool.primary) return <PillTool tool={tool} />;
  return (
    <button type="button" onClick={(event) => tool.onClick(anchorOf(event.currentTarget))} aria-label={tool.label} aria-pressed={tool.active} data-motion={tool.motion} className={`${ICON_BUTTON} ${tool.active ? ON : ''}`}>
      {tool.line ? <LineIcon name={tool.line} size={18} inherit /> : Icon ? <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" /> : null}
      {tool.dot ? <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--coral)]" /> : null}
    </button>
  );
}

/** A view switch written out: each tool of the section is its name, the current one on a quiet fill (coral stays for actions). Icon-only segments (`line`) mark the pressed one as a paper pill in coral ink. */
function SectionSwitch({ name, tools }: { name: string; tools: StageTool[] }) {
  return (
    <div role="group" aria-label={name} className="mr-1 flex h-[var(--toolbar-btn)] items-center gap-0.5 rounded-full border border-[var(--line-2)] p-0.5">
      {tools.map((tool) =>
        tool.line ? (
          <button
            key={tool.id}
            type="button"
            aria-label={tool.label}
            title={tool.label}
            onClick={(event) => tool.onClick(anchorOf(event.currentTarget))}
            aria-pressed={tool.active ?? false}
            className={`flex h-full w-9 items-center justify-center rounded-full ${FOCUS} ${tool.active ? 'bg-[var(--paper)] text-[var(--coral-ink)] shadow-[var(--shadow-pill)]' : 'text-[var(--ink-2)] hover:bg-[var(--hover)] hover:text-[var(--ink)]'}`}
          >
            <LineIcon name={tool.line} size={18} inherit />
          </button>
        ) : (
          <button
            key={tool.id}
            type="button"
            onClick={(event) => tool.onClick(anchorOf(event.currentTarget))}
            aria-pressed={tool.active ?? false}
            className={`flex h-full items-center rounded-full border border-transparent px-3 text-[12.5px] font-medium ${FOCUS} ${tool.active ? 'bg-[var(--paper-3)] font-semibold text-[var(--ink)]' : 'text-[var(--ink-2)] hover:bg-[var(--hover)] hover:text-[var(--ink)]'}`}
          >
            {tool.label}
          </button>
        ),
      )}
    </div>
  );
}

type ToolEntry = { kind: 'tool'; tool: StageTool } | { kind: 'section'; name: string; tools: StageTool[] };

/** Neighbouring tools that share a section become one switch; every other tool stays on its own. */
export function groupTools(tools: readonly StageTool[]): ToolEntry[] {
  const out: ToolEntry[] = [];
  for (const tool of tools) {
    const last = out[out.length - 1];
    if (tool.section && last?.kind === 'section' && last.name === tool.section) last.tools.push(tool);
    else if (tool.section) out.push({ kind: 'section', name: tool.section, tools: [tool] });
    else out.push({ kind: 'tool', tool });
  }
  return out;
}

/** Shows or hides the side panel: at the end of the tools while the panel is closed, above the panel while it is open. `icon` replaces the default glyph. */
export function PanelToggle({ open, onToggle, icon }: { open: boolean; onToggle: () => void; icon?: ReactNode }) {
  return (
    <button type="button" onClick={onToggle} aria-label={open ? 'Hide side panel' : 'Show side panel'} aria-pressed={open} className={`${ICON_BUTTON} ${open ? ON : ''}`}>
      {icon ?? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M15 4v16" />
        </svg>
      )}
    </button>
  );
}

export interface BarToolsProps {
  leading?: ReactNode;
  trailing?: ReactNode;
  /** The toggle, drawn after a divider; null while the panel is open or the screen has none. */
  panelToggle?: ReactNode;
  /** A thin divider before the toggle (Drift); Harbour leaves it out. */
  divider?: boolean;
}

export function BarTools({ leading, trailing, panelToggle, divider = true }: BarToolsProps) {
  const tools = useRegisteredStageTools();
  return (
    <div role="toolbar" aria-label="Tools" className="flex flex-shrink-0 items-center gap-0.5">
      {leading}
      {groupTools(tools).map((entry) => (entry.kind === 'tool' ? <ToolButton key={entry.tool.id} tool={entry.tool} /> : <SectionSwitch key={entry.name} name={entry.name} tools={entry.tools} />))}
      {trailing}
      {panelToggle ? (
        <>
          {divider ? <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--line-2)]" /> : null}
          {panelToggle}
        </>
      ) : null}
    </div>
  );
}
