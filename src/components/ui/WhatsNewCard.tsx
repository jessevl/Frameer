/**
 * @file WhatsNewCard.tsx
 * @description The What's new pill: after an update, a small card with a picture, "What's new in <App> 0.1.4" and how many changes. Open shows the release's new features and fixes in a modal; closing it marks the release seen on this device, and the card is gone until the next release. A build without notes, or a release already read, shows nothing. The app places it (Home, under a greeting) and passes the picture; the notes and the seen state come from `createWhatsNew`.
 * @app SHARED - Generic: knows nothing about any app.
 * Used by: the apps' home or landing screens.
 */
import React, { useState } from 'react';
import type { WhatsNew } from '@frameer/lib/whatsNew';
import Modal from './Modal';

export interface WhatsNewCardProps {
  /** From `createWhatsNew`, built once at module level. */
  source: WhatsNew;
  /** The app's name, in the title: "What's new in Drift 0.1.4". */
  appName: string;
  /** A small picture on the left of the pill (a decorative element; hide it from assistive technology yourself). */
  picture?: React.ReactNode;
  /** Called once the notes are closed, so the screen can drop other signs of the news too. */
  onSeen?: () => void;
  /** `data-testid` of the card. */
  testId?: string;
  className?: string;
}

/** The release's notes behind a quiet pill that goes away once read. */
export const WhatsNewCard: React.FC<WhatsNewCardProps> = ({ source, appName, picture, onSeen, testId, className = '' }) => {
  const { release } = source;
  const [seen, setSeen] = useState(() => !release.version || source.isSeen());
  const [open, setOpen] = useState(false);
  if (seen || release.notes.length === 0) return null;

  const close = () => {
    source.markSeen();
    setOpen(false);
    setSeen(true);
    onSeen?.();
  };
  const count = release.notes.length;
  const title = `What's new in ${appName} ${release.version}`;

  return (
    <section
      aria-label="What's new"
      data-testid={testId}
      className={`relative flex h-9 w-fit max-w-full items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper-2)] pl-1 pr-3 text-[12.5px] ${className}`}
    >
      {picture}
      <h2 className="m-0 truncate text-[12.5px] font-medium text-[var(--ink)]">{title}</h2>
      <span className="flex-none text-[var(--ink-2)]">
        {count} {count === 1 ? 'change' : 'changes'}
      </span>
      <button type="button" onClick={() => setOpen(true)} className="flex-none rounded text-[var(--coral-ink)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--coral-line)]">
        Open
      </button>
      <Modal isOpen={open} onClose={close} title={title} size="md">
        <ul aria-label="Changes" className="m-0 flex list-none flex-col gap-2.5 p-0">
          {release.notes.map((note) => (
            <li key={`${note.kind}:${note.text}`} className="flex items-baseline gap-2.5 text-sm text-[var(--ink)]">
              <span className="w-12 flex-none text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">{note.kind}</span>
              <span>{note.text}</span>
            </li>
          ))}
        </ul>
      </Modal>
    </section>
  );
};
