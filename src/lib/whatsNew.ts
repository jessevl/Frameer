/**
 * @file whatsNew.ts
 * @description What's new: a release's notes, bundled into the build. The release workflow writes the new features and fixes since the last release (their commit subjects) into the build as base64 (an app reads it from `import.meta.env`, for example `VITE_WHATS_NEW`, with the version in `VITE_APP_VERSION`), so the notes work offline and need no call to GitHub. This file is pure parsing and one tiny device store; it reads no environment itself, because a library cannot rely on its host's build constants. A build without notes (a dev build) has none to show.
 * @app SHARED - Generic: the storage key and the build values come from the app.
 * Used by: WhatsNewCard, and the apps' own entry points (a badge that says there is news).
 */

export interface WhatsNewNote {
  kind: 'New' | 'Fixed';
  text: string;
}

export interface WhatsNewRelease {
  version: string;
  notes: WhatsNewNote[];
}

/** The notes shown at most; the rest are in the release on GitHub. */
export const MAX_NOTES = 8;

/** Base64 of UTF-8 text back to the text; anything unreadable is no text. */
export function decodeNotes(base64: string): string {
  try {
    const bytes = Uint8Array.from(atob(base64.trim()), (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

/** One note per line "feat(scope): subject" or "fix(scope): subject"; other kinds of change are not news. At most MAX_NOTES. */
export function parseNotes(text: string): WhatsNewNote[] {
  const notes: WhatsNewNote[] = [];
  for (const line of text.split('\n')) {
    const match = /^\s*(feat|fix)(\([^)]*\))?!?:\s*(.+?)\s*$/.exec(line);
    const subject = match?.[3]?.replace(/\[(minor|major)\]/gi, '').trim();
    if (!match || !subject) continue;
    notes.push({ kind: match[1] === 'feat' ? 'New' : 'Fixed', text: subject.charAt(0).toUpperCase() + subject.slice(1) });
    if (notes.length === MAX_NOTES) break;
  }
  return notes;
}

export interface WhatsNewSource {
  /** The localStorage key that holds the last version whose notes were read on this device (for example `drift.whatsNew.seen`). */
  seenKey: string;
  /** This build's version (an empty string for a dev build, which has nothing to show). */
  version: string;
  /** This build's notes as base64 of UTF-8 text (empty for a dev build). */
  notes: string;
}

export interface WhatsNew {
  /** This build's version and its parsed notes. */
  release: WhatsNewRelease;
  /** Whether this release's notes have been opened on this device. A device that keeps nothing counts as seen, so nothing nags. */
  isSeen(): boolean;
  /** Whether this build has notes not yet read on this device. */
  hasUnseen(): boolean;
  /** Records that the notes were read; a device that keeps nothing simply shows them again next time. */
  markSeen(): void;
}

/** What's new for one build: the parsed release and its seen state on this device. */
export function createWhatsNew({ seenKey, version, notes }: WhatsNewSource): WhatsNew {
  const release: WhatsNewRelease = { version, notes: parseNotes(decodeNotes(notes)) };
  const isSeen = (): boolean => {
    try {
      return localStorage.getItem(seenKey) === version;
    } catch {
      return true;
    }
  };
  return {
    release,
    isSeen,
    hasUnseen: () => release.version !== '' && release.notes.length > 0 && !isSeen(),
    markSeen: () => {
      try {
        localStorage.setItem(seenKey, version);
      } catch {
        // A device that keeps nothing shows the card again next time.
      }
    },
  };
}
