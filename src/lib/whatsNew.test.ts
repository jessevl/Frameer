/**
 * @file whatsNew.test.ts
 * @vitest-environment jsdom
 * @description What's new notes: base64 of UTF-8 back to text, only features and fixes become notes (worded for people), at most eight, and a device remembers which release it has seen, under the key the app gives.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_NOTES, createWhatsNew, decodeNotes, parseNotes } from './whatsNew';

const b64 = (text: string) => Buffer.from(text, 'utf8').toString('base64');

describe('decodeNotes', () => {
  it('reads UTF-8 back from base64, and nothing from garbage', () => {
    expect(decodeNotes(b64('feat: café · ✓'))).toBe('feat: café · ✓');
    expect(decodeNotes('%%%')).toBe('');
  });
});

describe('parseNotes', () => {
  it('keeps features as New and fixes as Fixed, with a capital and without bump markers', () => {
    expect(parseNotes('feat(home): greeting desk\nchore: bump version\nfix(sync)!: the boat sails again [minor]\nrefactor: tidy')).toEqual([
      { kind: 'New', text: 'Greeting desk' },
      { kind: 'Fixed', text: 'The boat sails again' },
    ]);
  });

  it('shows at most eight', () => {
    expect(parseNotes(Array.from({ length: 12 }, (_, i) => `feat: thing ${i}`).join('\n'))).toHaveLength(MAX_NOTES);
  });
});

describe('createWhatsNew', () => {
  beforeEach(() => localStorage.clear());

  it('remembers the release whose notes were opened, under the app\'s key', () => {
    const news = createWhatsNew({ seenKey: 'app.whatsNew.seen', version: '0.1.4', notes: b64('feat: a thing') });
    expect(news.release.notes).toHaveLength(1);
    expect(news.isSeen()).toBe(false);
    expect(news.hasUnseen()).toBe(true);
    news.markSeen();
    expect(localStorage.getItem('app.whatsNew.seen')).toBe('0.1.4');
    expect(news.isSeen()).toBe(true);
    expect(news.hasUnseen()).toBe(false);
  });

  it('has nothing to show for a build without a version or notes', () => {
    expect(createWhatsNew({ seenKey: 'k', version: '', notes: b64('feat: a') }).hasUnseen()).toBe(false);
    expect(createWhatsNew({ seenKey: 'k', version: '1.0.0', notes: '' }).hasUnseen()).toBe(false);
  });
});
