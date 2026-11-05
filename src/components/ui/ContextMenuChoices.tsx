/**
 * @file ContextMenuChoices.tsx
 * @description The compact choice row of a context menu: the item's label on the left and a row of round options on the right, either color swatches or people's avatars. One choice (`menuitemradio`) or several that are on together (`menuitemcheckbox`). The chosen option carries a coral ring, which is what coral is for here; the others are quiet. Each option has an accessible name and a tooltip, so avatars and colors are never anonymous.
 * Based on drift@d91d6950:frontend/src/items/ui/MenuList.tsx (the `swatches` row)
 *
 * The keyboard lives in ContextMenuContent: Up and Down move between rows (a choice row is one stop), Left and Right move between its options, Enter and Space toggle one.
 * Used by: ContextMenuContent.
 */
import React from 'react';
import { cn } from '@frameer/lib/design-system';
import { hueVar, type HueName } from '@frameer/lib/hues';
import { Avatar } from './Avatar';

export interface ContextMenuChoice {
  id: string;
  /** The option's name: its accessible name and its tooltip ("Mara", "Sage"). */
  label: string;
  /** The hue of the swatch or of the avatar. */
  hue?: HueName;
  /** For avatars: the letters to show when they should not be taken from the label ("MV"). */
  initials?: string;
  /** For avatars: a picture. */
  src?: string;
  /** Whether the option is chosen (or, with `multiple`, on). */
  on: boolean;
}

export interface ContextMenuChoices {
  kind: 'swatch' | 'avatar';
  /** Several options can be on together; the menu then stays open after a toggle. */
  multiple: boolean;
  options: ContextMenuChoice[];
  /** Called with the option's id. For a single choice the menu closes after it, unless the item sets `keepOpen`. */
  onToggle: (id: string) => void;
}

interface ChoiceRowProps {
  itemId: string;
  label: string;
  choices: ContextMenuChoices;
  touchFriendly: boolean;
  nested: boolean;
  onPick: (optionId: string) => void;
}

export const ChoiceRow: React.FC<ChoiceRowProps> = ({ itemId, label, choices, touchFriendly, nested, onPick }) => {
  const { kind, multiple, options } = choices;
  // The one stop of the row for Up and Down: the chosen option, else the first.
  const stop = (options.find((o) => o.on) ?? options[0])?.id;
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex items-center gap-2 px-2 text-[12.5px] font-medium text-[var(--ink-2)]', touchFriendly ? 'min-h-11' : 'min-h-[30px] pointer-coarse:min-h-11', nested && 'pl-3')}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="flex flex-wrap items-center justify-end gap-1">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role={multiple ? 'menuitemcheckbox' : 'menuitemradio'}
            aria-checked={option.on}
            aria-label={option.label}
            title={option.label}
            data-choice-row={itemId}
            data-choice-id={option.id}
            data-choice-stop={option.id === stop ? '' : undefined}
            tabIndex={-1}
            onClick={() => onPick(option.id)}
            onKeyUp={(e) => e.key === ' ' && e.preventDefault()}
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--paper)]',
              kind === 'swatch' ? 'h-5 w-5 pointer-coarse:h-8 pointer-coarse:w-8' : 'p-0.5 pointer-coarse:p-1.5',
              // The chosen one: a coral ring. Unchosen avatars are quiet; swatches keep their color.
              option.on && 'ring-2 ring-[var(--coral)] ring-offset-1 ring-offset-[var(--paper)]',
              kind === 'avatar' && !option.on && 'opacity-55 hover:opacity-100',
            )}
          >
            {kind === 'swatch' ? (
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 rounded-full pointer-coarse:h-5 pointer-coarse:w-5"
                style={{ background: option.hue ? hueVar(option.hue, 'fill') : 'var(--paper-3)', boxShadow: `inset 0 0 0 1.5px ${option.hue ? hueVar(option.hue, 'stroke') : 'var(--line)'}` }}
              />
            ) : (
              <Avatar name={option.label} initials={option.initials} hue={option.hue} src={option.src} size="sm" />
            )}
          </button>
        ))}
      </span>
    </div>
  );
};
