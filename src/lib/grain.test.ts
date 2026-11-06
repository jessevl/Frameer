/**
 * @file grain.test.ts
 * @description The shipped grain tiles (`styles/grain/*.png`) equal what `grainField` and `grainPixels` produce. Change the generator and this fails until `node --experimental-strip-types scripts/gen-grain.ts` is run again.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GRAIN_SIZE, grainField, grainPixels } from './grain';
import { decodeGrainPng, encodeGrainPng } from '../../scripts/grainPng';

const field = grainField();
const cases = [
  ['light.png', false, false],
  ['light-low.png', false, true],
  ['dark.png', true, false],
  ['dark-low.png', true, true],
] as const;

describe('shipped grain tiles', () => {
  it.each(cases)('%s matches the generator', (name, dark, low) => {
    const file = readFileSync(join(import.meta.dirname, '../styles/grain', name));
    expect(file.readUInt32BE(16)).toBe(GRAIN_SIZE);
    const expected = grainPixels(field, dark, low);
    expect(Buffer.compare(Buffer.from(decodeGrainPng(file)), Buffer.from(expected))).toBe(0);
    expect(Buffer.compare(file, encodeGrainPng(expected))).toBe(0);
  });
});
