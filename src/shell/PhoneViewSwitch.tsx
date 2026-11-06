/**
 * @file PhoneViewSwitch.tsx
 * @description The display switch on a phone, which has no docked bar: the tools a view marks `phoneSwitch` as one segmented row of 44 px targets under the header. Views without such tools show nothing.
 * Used by: the app shell's phone stage.
 */
import { anchorOf, useRegisteredStageTools } from './stageTools';

export function PhoneViewSwitch() {
  const tools = useRegisteredStageTools().filter((tool) => tool.phoneSwitch);
  const [first] = tools;
  if (!first) return null;
  return (
    <div role="group" aria-label={first.section ?? 'View'} className="mx-3.5 mt-3 flex flex-shrink-0 items-center gap-0.5 rounded-full border border-[var(--line-2)] p-0.5">
      {tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          onClick={(event) => tool.onClick(anchorOf(event.currentTarget))}
          aria-pressed={tool.active ?? false}
          className={`h-11 flex-1 rounded-full text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] ${tool.active ? 'bg-[var(--paper-3)] font-semibold text-[var(--ink)]' : 'font-medium text-[var(--ink-2)]'}`}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
