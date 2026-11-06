/**
 * @file gen-grain.ts
 * @description Writes the paper grain tiles (`src/styles/grain/{light,dark}{,-low}.png`) from `src/lib/grain.ts`. Run `node --experimental-strip-types scripts/gen-grain.ts` after changing the generator; `grain.test.ts` fails until you do.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { encodeGrainPng } from './grainPng.ts';
import { grainField, grainPixels } from '../src/lib/grain.ts';

const out = new URL('../src/styles/grain/', import.meta.url);
mkdirSync(out, { recursive: true });
const field = grainField();
for (const dark of [false, true]) {
  for (const low of [false, true]) {
    writeFileSync(new URL(`${dark ? 'dark' : 'light'}${low ? '-low' : ''}.png`, out), encodeGrainPng(grainPixels(field, dark, low)));
  }
}
