/**
 * @file grainPng.ts
 * @description A deterministic 256x256 RGBA PNG encoder (Node only: `zlib`), used to make the grain tiles and by the test that checks them. Not exported from the package.
 * Used by: `gen-grain.ts`, `src/lib/grain.test.ts`.
 */
import { deflateSync, inflateSync } from 'node:zlib';
import { GRAIN_SIZE } from '../src/lib/grain.ts';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (b: Uint8Array) => {
  let c = 0xffffffff;
  for (const v of b) c = (crcTable[(c ^ v) & 255] ?? 0) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type: string, data: Uint8Array) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  out.set(data, 8);
  out.writeUInt32BE(crc(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};

export function encodeGrainPng(rgba: Uint8ClampedArray): Buffer {
  const n = GRAIN_SIZE;
  const raw = Buffer.alloc((n * 4 + 1) * n);
  for (let y = 0; y < n; y++) raw.set(rgba.subarray(y * n * 4, (y + 1) * n * 4), y * (n * 4 + 1) + 1);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(n, 0);
  ihdr.writeUInt32BE(n, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array())]);
}

/** The RGBA pixels of a PNG made by `encodeGrainPng` (8-bit RGBA, filter 0 only). */
export function decodeGrainPng(png: Buffer): Uint8ClampedArray {
  const n = GRAIN_SIZE;
  let pos = 8;
  const idat: Buffer[] = [];
  while (pos < png.length) {
    const len = png.readUInt32BE(pos);
    if (png.toString('ascii', pos + 4, pos + 8) === 'IDAT') idat.push(png.subarray(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const out = new Uint8ClampedArray(n * n * 4);
  for (let y = 0; y < n; y++) out.set(raw.subarray(y * (n * 4 + 1) + 1, (y + 1) * (n * 4 + 1)), y * n * 4);
  return out;
}
