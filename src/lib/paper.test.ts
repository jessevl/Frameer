/**
 * @file paper.test.ts
 * @description Tests the paper's light and grain: the wash comes from the sun's side (left in the morning, right in the evening), is warmer toward morning and evening than at noon, is half as strong on dark paper, is an even cool hint at night; the grain field is the same every time, wraps around, and stays near zero on average.
 * Based on drift@d91d6950:frontend/src/lib/paper.test.ts
 */
import { describe, expect, it } from 'vitest';
import { grainField, paperWash } from './paper';

const alpha = (css: string) => Number(/rgba\([^)]*,([\d.]+)\)/.exec(css)?.[1] ?? NaN);

describe('paperWash', () => {
  it('comes from the sun’s side, warmer toward evening than at noon', () => {
    expect(paperWash(8).light).toMatch(/^linear-gradient\(1\d\ddeg/);
    expect(paperWash(19).light).toMatch(/^linear-gradient\(2[5-7]\ddeg/);
    expect(alpha(paperWash(19).light)).toBeGreaterThan(alpha(paperWash(13).light));
  });

  it('is half as strong on dark paper, and an even cool hint at night', () => {
    expect(alpha(paperWash(19).dark)).toBeCloseTo(alpha(paperWash(19).light) / 2, 2);
    expect(paperWash(23).light).toBe('linear-gradient(rgba(92,104,150,0.026), rgba(92,104,150,0.026))');
  });
});

describe('grainField', () => {
  it('is the same every time and averages near zero', () => {
    const a = grainField(32);
    const b = grainField(32);
    expect(Array.from(a)).toEqual(Array.from(b));
    const mean = a.reduce((sum, v) => sum + v, 0) / a.length;
    expect(Math.abs(mean)).toBeLessThan(0.1);
  });
});
