/**
 * @file appMark.test.ts
 * @description The shared app-mark recipe: the coral front repaints only the body and softens the highlights, the home tile is rounded or full bleed with the mark scaled into it, and the gradient and frame carry their arguments.
 */
import { describe, expect, it } from 'vitest';
import { coralFront, coralGradient, homeTile, MARK_CORAL, monoFrame } from './appMark';
import { glass, SHAPES } from './glass';
import { CORAL_PALETTE } from './palette';

describe('the app-mark recipe', () => {
  it('paints the coral front from the cbody gradient and keeps a little of the glass highlights', () => {
    const plain = glass('a_', CORAL_PALETTE, SHAPES.std);
    const front = coralFront('a_');
    expect(plain).toContain('url(#a_body)');
    expect(front).not.toContain('url(#a_body)');
    expect(front).toContain('url(#a_cbody)');
    expect(front).toContain('<g opacity="0.55" clip-path');
    expect(coralGradient('a_cbody')).toContain(`id="a_cbody"`);
    expect(coralGradient('a_cbody')).toContain(MARK_CORAL[1]);
  });

  it('rounds the backdrop tile and runs the maskable one to the edge, the card inside the safe zone', () => {
    const backdrop = homeTile('a_', 'backdrop');
    const maskable = homeTile('a_', 'maskable');
    expect(backdrop.tile).toContain('rx="116"');
    expect(maskable.tile).toContain('rx="0"');
    for (const id of ['bg', 'bloom', 'vig']) expect(backdrop.tile).toContain(`fill="url(#a_${id})"`);
    expect(backdrop.transform).toBe(`translate(256 256) scale(${0.9 * 1.14}) translate(-256 -256)`);
    expect(maskable.transform).toBe(`translate(256 256) scale(${0.74 * 1.14}) translate(-256 -256)`);
  });

  it('draws the monochrome frame in the given ink and width', () => {
    expect(monoFrame('#111111', 18)).toBe('<rect x="96" y="92" width="320" height="328" rx="62" fill="none" stroke="#111111" stroke-width="18"/>');
  });
});
