/**
 * @file house-pictures.ts
 * @description Draws the clay engine's example pictures (clay/house/examples) in a real browser and writes them as PNGs, and with `--ref <dir>` compares each with a reference PNG of the same name (the Hearth concept's renders in hearth-concept/clay2/out): size, mean difference per channel and the share of pixels that differ visibly. Bundles the module with esbuild (Frameer's own, through tsup) and drives Chromium with Playwright from the app Frameer sits in, so Frameer adds no dependency; set FRAMEER_HOST_MODULES to that app's node_modules when it is not one level up.
 * Run: node --experimental-strip-types scripts/house-pictures.ts --out <dir> [--ref <dir>] [names...]
 * Used by: whoever changes the engine, to see what changed (the unit tests only check the drawing calls).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const out = path.resolve(flag('--out') ?? path.join(root, 'house-pictures'));
const ref = flag('--ref');
const only = args;

const hostModules = process.env.FRAMEER_HOST_MODULES ?? path.resolve(root, '..', 'node_modules');
const req = createRequire(path.join(hostModules, 'noop.js'));
const own = createRequire(path.join(root, 'package.json'));
const { chromium } = req('playwright') as typeof import('playwright');
const esbuild = own('esbuild') as typeof import('esbuild');

/** The pictures: the Hearth concept's jobs (clay2/jobs*.json), by the names of its renders. */
const STYLES = ['rich', 'clay', 'birch', 'stone', 'lantern', 'blush', 'half', 'stoneclay', 'clayoak'];
const JOBS: Record<string, unknown> = {
  home: { home: 'evening', show: ['ground', 'first', 'second'], step: [109 / 29.5, 197 / 29.5], plot: true, time: 'night', s: 29.5, pad: 8 },
  rooms: { home: 'cooking', show: ['ground'], plot: true, selected: 'kitchen', time: 'dusk', s: 47 },
  builder: { home: 'plain', show: ['ground'], selected: 'kitchen', handles: true, grid: true, time: 'day', s: 50 },
  'panel-first': { home: 'night', show: ['first'], time: 'night', s: 30 },
  'phone-living': { home: 'evening', show: ['ground'], only: 'living', time: 'night', s: 31 },
  'panel-kitchen': { home: 'cooking', show: ['ground'], only: 'kitchen', time: 'dusk', s: 40 },
  'v-car': { car: 'home', time: 'dusk', s: 40 },
  'v-car-phone': { car: 'waiting', time: 'dusk', s: 40 },
  'v-battery': { battery: [0.49, 0.37], time: 'night', s: 60 },
  'v-heat': { heat: { running: false, tank: 0.8, vent: 1 }, time: 'day', s: 50 },
  ...Object.fromEntries(['Sofa', 'Table', 'Bed', 'Island', 'Bath', 'Desk', 'Plant', 'Lamp'].map((p) => [`th-${p.toLowerCase()}`, { tray: p, time: 'day', s: 38 }])),
  'desk-g-day': { desk: {}, time: 'day', s: 110 },
  'desk-g-night': { desk: { lamp: true }, time: 'night', s: 110 },
  'desk-b-day': { desk: {}, time: 'day', s: 110, style: 'clay' },
  'yard-g-day': { yard: {}, time: 'day', s: 62 },
  'yard-g-night': { yard: {}, time: 'night', s: 62 },
  'outline-day': { outline: { selected: 'hall', handles: true }, time: 'day', s: 60 },
  'outline-night': { outline: {}, time: 'night', s: 60 },
  ...Object.fromEntries(STYLES.map((st) => [`var-${st}-day`, { home: 'cooking', show: ['ground'], plot: true, time: 'day', s: 46, style: st }])),
};

const entry = `
import { drawScene } from './src/clay/house/scene';
import { homeScene } from './src/clay/house/examples/home';
import { carScene, batteryScene, heatScene, trayScene } from './src/clay/house/examples/small';
import { deskScene } from './src/clay/house/examples/desk';
import { yardScene } from './src/clay/house/examples/yard';
import { outlineScene } from './src/clay/house/examples/outline';
window.render = (j) => {
  const scene = j.outline ? { house: outlineScene(j.outline) } : j.home ? { house: homeScene(j.home, { show: j.show, only: j.only, plot: j.plot, step: j.step, selected: j.selected, handles: j.handles, grid: j.grid }) }
    : j.car ? { closeup: carScene(j.car, j.time) } : j.battery ? { closeup: batteryScene(j.battery) } : j.heat ? { closeup: heatScene(j.heat) }
    : j.tray ? { closeup: trayScene(j.tray) } : j.desk ? { closeup: deskScene(j.desk) } : { closeup: yardScene(j.yard) };
  const p = drawScene(scene, { style: j.style ?? 'half', time: j.time, s: j.s, pad: j.pad, dpr: 2 });
  return { url: p.canvas.toDataURL('image/png'), w: p.w, h: p.h, marks: p.marks };
};
window.compare = async (a, b) => {
  const load = (u) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
  const [ia, ib] = await Promise.all([load(a), load(b)]);
  const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
  const px = (img) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
  const da = px(ia), db = px(ib);
  let sum = 0, n = 0, visible = 0;
  for (let i = 0; i < da.length; i += 4) {
    if (da[i + 3] < 8 && db[i + 3] < 8) continue;
    const d = (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) + Math.abs(da[i + 3] - db[i + 3])) / 4;
    sum += d; n++; if (d > 24) visible++;
  }
  return { size: [ia.width, ia.height, ib.width, ib.height], mean: n ? sum / n : 0, visible: n ? visible / n : 0 };
};
`;

const bundle = await esbuild.build({ stdin: { contents: entry, resolveDir: root, loader: 'ts' }, bundle: true, write: false, format: 'iife', target: 'es2020', alias: { '@frameer': path.join(root, 'src') }, logLevel: 'error' });
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('ERR', e.message));
await page.setContent('<html><body></body></html>');
await page.addScriptTag({ content: bundle.outputFiles[0].text });
fs.mkdirSync(out, { recursive: true });
const rows: string[] = [];
for (const [name, job] of Object.entries(JOBS)) {
  if (only.length && !only.includes(name)) continue;
  const r = (await page.evaluate((j) => (window as unknown as { render: (j: unknown) => { url: string; w: number; h: number } }).render(j), job)) as { url: string; w: number; h: number };
  fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(r.url.split(',')[1], 'base64'));
  let line = `${name.padEnd(18)} ${String(r.w).padStart(4)} x ${String(r.h).padEnd(4)}`;
  const refFile = ref ? path.join(ref, `${name}.png`) : '';
  if (refFile && fs.existsSync(refFile)) {
    const b = 'data:image/png;base64,' + fs.readFileSync(refFile).toString('base64');
    const c = (await page.evaluate(([a, bb]) => (window as unknown as { compare: (a: string, b: string) => Promise<unknown> }).compare(a, bb), [r.url, b])) as { size: number[]; mean: number; visible: number };
    line += ` ref ${c.size[2]} x ${c.size[3]}  mean diff ${c.mean.toFixed(2)}  visibly different ${(c.visible * 100).toFixed(1)}%`;
  }
  rows.push(line);
  console.log(line);
}
fs.writeFileSync(path.join(out, 'report.txt'), rows.join('\n') + '\n');
await browser.close();
