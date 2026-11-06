/**
 * @file ShortcutSheet.tsx
 * @description The list of keyboard shortcuts and the sheet that shows it. `ShortcutList` is a table of keys and what they do, built from the rows the app gives (`shortcutRows(keymap)` plus any keys the keymap does not hold, such as a Ctrl+Enter that a form handles itself); rows with a `group` sit under group headings. `ShortcutSheet` is the list in a modal, as `?` opens it. A key is shown in a keycap; a sequence reads "g then m". The table is focusable so it can be scrolled with the keyboard.
 * @app SHARED - Generic: the rows come from the app's keymap.
 * Used by: the apps' shells (the `?` sheet) and their Shortcuts settings pages.
 */
import React from 'react';
import type { ShortcutRow } from '@frameer/lib/shortcuts';
import Modal from './Modal';

const KEYCAP = 'inline-flex min-w-[24px] items-center justify-center rounded-md border border-[var(--line-2)] bg-[var(--paper-2)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--ink)]';

const Keys: React.FC<{ keys: readonly string[] }> = ({ keys }) => (
  <span className="inline-flex items-center gap-1">
    {keys.map((key, i) => (
      <span key={`${key}${i}`} className="inline-flex items-center gap-1">
        {i > 0 ? <span className="text-[12px] text-[var(--ink-2)]">then</span> : null}
        <kbd className={KEYCAP}>{key}</kbd>
      </span>
    ))}
  </span>
);

export interface ShortcutListProps {
  /** Every shortcut to show, in order. Build it with `shortcutRows(keymap)` and add the keys outside the keymap. */
  rows: readonly ShortcutRow[];
  /** The table's caption for assistive technology. Default "Keyboard shortcuts". */
  caption?: string;
  /** `data-testid` of the table. */
  testId?: string;
}

/** The table of shortcuts. */
export const ShortcutList: React.FC<ShortcutListProps> = ({ rows, caption = 'Keyboard shortcuts', testId = 'shortcut-list' }) => {
  let lastGroup: string | undefined;
  return (
    <table tabIndex={0} className="w-full text-left text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-line)]" data-testid={testId}>
      <caption className="sr-only">{caption}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Keys</th>
          <th scope="col">What it does</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const heading = row.group && row.group !== lastGroup ? row.group : null;
          lastGroup = row.group ?? lastGroup;
          return (
            <React.Fragment key={`${row.label}:${row.keys.join('+')}:${index}`}>
              {heading ? (
                <tr>
                  <th scope="colgroup" colSpan={2} className="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
                    {heading}
                  </th>
                </tr>
              ) : null}
              <tr className="border-t border-[var(--line)] first:border-t-0">
                <td className="whitespace-nowrap py-2 pr-4">
                  <Keys keys={row.keys} />
                </td>
                <td className="py-2 text-[var(--ink)]">{row.label}</td>
              </tr>
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export interface ShortcutSheetProps extends Omit<ShortcutListProps, 'caption'> {
  onClose: () => void;
  /** Whether the sheet is open (default true: mount it while it is open). */
  isOpen?: boolean;
  title?: string;
  /** The line under the list. Default "Shortcuts do nothing while you are typing in a field."; pass `null` for none. */
  note?: React.ReactNode | null;
}

/** The shortcut list in a modal. */
export const ShortcutSheet: React.FC<ShortcutSheetProps> = ({ rows, testId, onClose, isOpen = true, title = 'Keyboard shortcuts', note = 'Shortcuts do nothing while you are typing in a field.' }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <ShortcutList rows={rows} testId={testId} caption={title} />
    {note ? <p className="mt-3 text-[12.5px] text-[var(--ink-2)]">{note}</p> : null}
  </Modal>
);
