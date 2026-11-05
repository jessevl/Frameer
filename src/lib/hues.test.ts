/**
 * @file hues.test.ts
 * @description The hue names and `styles/hues.css` agree: every name has all four tokens in light, and the three solid ones in dark.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HUE_NAMES, hueVar, isHueName } from './hues';

const css = readFileSync(path.resolve(import.meta.dirname, '../styles/hues.css'), 'utf8');
const [light = '', dark = ''] = css.split('.dark {');

describe('hues', () => {
  it('has ten hues, none of them coral', () => {
    expect(HUE_NAMES).toHaveLength(10);
    expect(isHueName('coral')).toBe(false);
    expect(isHueName('teal')).toBe(true);
  });

  it('has every token in hues.css', () => {
    for (const name of HUE_NAMES) {
      for (const step of ['fill', 'stroke', 'ink', 'mark'] as const) expect(light).toContain(`--hue-${name}-${step}:`);
      for (const step of ['fill', 'stroke', 'ink'] as const) expect(dark).toContain(`--hue-${name}-${step}:`);
    }
  });

  it('names a step as a CSS variable reference', () => {
    expect(hueVar('blue', 'ink')).toBe('var(--hue-blue-ink)');
  });
});
