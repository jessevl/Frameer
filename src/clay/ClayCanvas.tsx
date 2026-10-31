/**
 * @file ClayCanvas.tsx
 * @description A canvas that holds one clay picture: it follows its box's size and the device's pixel ratio, draws in the theme of where it is (dark inside any `.dark`), repaints when the theme changes, and runs on one shared frame loop at about 30 fps, only while it is on screen and only while the picture is alive (`live`) or still settling (the draw returned true). With reduced motion it draws one still frame per change, with every movement already finished. Living pictures (D16): shadows follow the hour's sun, a picture leans toward the pointer and squashes when pressed, and a seasonal visitor falls past a large one now and then (`alive`). The picture is decoration: hidden from assistive technology.
 * Used by: the apps' picture components (Drift's desk, done pile, boat and empty states).
 */
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { hash, sunAt, type ClayPalette } from './clay';
import { clayPalette, forgetClayPalette } from './clayPalette';
import { VISIT_EVERY_MS, VISIT_MS, drawVisitor, roomForVisitor, seasonOf } from './visitors';

/** What a picture is drawn with: its size in CSS pixels, the loop's clock, the wall clock for events, and the palette. */
export interface ClayFrame {
  w: number;
  h: number;
  /** Milliseconds on the loop's clock, 0 with reduced motion; for idle movement (a sway, a bob). */
  t: number;
  /** `performance.now()`, for how far an event (a sheet carried to the pile) has come. */
  now: number;
  /** True with reduced motion: draw every movement as finished. */
  reduced: boolean;
  pal: ClayPalette;
}

/** Draws one frame; returns true while something is still moving, so the loop keeps going for it. */
export type ClayDraw = (ctx: CanvasRenderingContext2D, frame: ClayFrame) => boolean | void;

interface Scene {
  el: HTMLCanvasElement;
  paint: () => boolean;
  visible: boolean;
  live: boolean;
  moving: boolean;
  /** Visitors (D16 C): whether this picture takes them, when the next is due, and when the current one set off. */
  visitors: boolean;
  nextVisit: number;
  visitAt: number | null;
  seed: number;
}

let sceneCount = 0;
const hourNow = () => {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
};

const scenes = new Set<Scene>();
let running = false;
let last = 0;
let themeWatch: MutationObserver | null = null;
let views: IntersectionObserver | null = null;

const reducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wants = (s: Scene) => s.visible && (s.live || s.moving) && !reducedMotion();

function loop(now: number) {
  if (now - last > 33) {
    last = now;
    scenes.forEach((s) => {
      if (wants(s)) s.moving = s.paint();
    });
  }
  if ([...scenes].some(wants)) requestAnimationFrame(loop);
  else running = false;
}

// Once a second, a picture whose visitor is due and that is on screen sends one across.
let visiting: ReturnType<typeof setInterval> | null = null;
function watchVisitors() {
  if (visiting) return;
  visiting = setInterval(() => {
    const now = performance.now();
    if (reducedMotion()) return;
    scenes.forEach((s) => {
      if (!s.visitors || !s.visible || s.visitAt !== null || now < s.nextVisit) return;
      s.visitAt = now;
      s.moving = true;
    });
    kick();
  }, 1000);
}

function kick() {
  if (running || ![...scenes].some(wants)) return;
  running = true;
  requestAnimationFrame(loop);
}

function watch() {
  if (!themeWatch && typeof MutationObserver !== 'undefined') {
    themeWatch = new MutationObserver(() => {
      forgetClayPalette();
      scenes.forEach((s) => (s.moving = s.paint() || s.moving));
    });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  if (!views && typeof IntersectionObserver !== 'undefined') {
    views = new IntersectionObserver((entries) =>
      entries.forEach((e) => {
        const s = [...scenes].find((q) => q.el === e.target);
        if (s) s.visible = e.isIntersecting;
      }),
    );
    kick();
  }
}

interface ClayCanvasProps {
  draw: ClayDraw;
  /** Keeps the loop running while visible, for idle movement; otherwise only events (the draw returning true) do. */
  live?: boolean;
  className?: string;
  /** Repaints when this changes (the data the picture shows). */
  version?: unknown;
  /** Living pictures (D16): visitors fall past a large picture now and then (C), and a picture leans toward the pointer and squashes when pressed (B). Off for scenes that fill a place, like a board's dots or the Focus Cabin. */
  alive?: boolean;
}

export function ClayCanvas({ draw, live = false, className, version, alive = true }: ClayCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  const sceneRef = useRef<Scene | null>(null);
  drawRef.current = draw;

  useEffect(() => {
    const el = ref.current;
    const ctx = el?.getContext('2d') ?? null;
    if (!el || !ctx) return;
    let w = 0;
    let h = 0;
    const start = performance.now();
    const paint = () => {
      if (!w || !h) return false;
      const reduced = reducedMotion();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      const dpr = el.width / w;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const now = performance.now();
      // One sun for every picture (D16 A): shadows fall away from the hour's sun.
      const pal = { ...clayPalette(el), sun: sunAt(hourNow()) };
      const busy = drawRef.current(ctx, { w, h, t: reduced ? 0 : now - start, now, reduced, pal }) === true;
      if (scene.visitAt === null) return busy;
      const p = (now - scene.visitAt) / VISIT_MS;
      if (p < 1 && !reduced && roomForVisitor(w, h)) {
        drawVisitor(ctx, w, h, pal, seasonOf(new Date().getMonth()), p, scene.seed);
        return true;
      }
      scene.visitAt = null;
      scene.nextVisit = now + VISIT_EVERY_MS * (1 + hash(scene.seed + 1) * 0.5);
      return busy;
    };
    const seed = (sceneCount += 1) * 7.13;
    const scene: Scene = { el, paint, visible: true, live, moving: false, visitors: false, nextVisit: start + VISIT_EVERY_MS * hash(seed), visitAt: null, seed };
    sceneRef.current = scene;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      scene.visitors = alive && roomForVisitor(w, h);
      scene.moving = paint();
      kick();
    };
    const sizes = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    sizes?.observe(el);
    scenes.add(scene);
    watch();
    watchVisitors();
    views?.observe(el);
    fit();
    return () => {
      sizes?.disconnect();
      views?.unobserve(el);
      scenes.delete(scene);
      sceneRef.current = null;
    };
  }, [live, alive]);

  // New data, or a new drawing: paint now and let the loop carry any movement it started.
  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;
    s.moving = s.paint();
    kick();
  }, [draw, version]);

  // Pictures answer your hand (D16 B): a slight lean toward the pointer, and a clay squash on a press.
  const lean = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const el = event.currentTarget;
    const r = el.getBoundingClientRect();
    if (!alive || r.width >= 720 || reducedMotion()) return;
    const dx = (event.clientX - r.left) / r.width - 0.5;
    const dy = (event.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${(dx * 5).toFixed(2)}deg) rotateX(${(-dy * 4).toFixed(2)}deg) translateY(-1px)`;
  };
  const squash = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const el = event.currentTarget;
    if (!alive || reducedMotion()) return;
    el.classList.remove('clay-squash');
    void el.offsetWidth;
    el.classList.add('clay-squash');
  };
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-clay=""
      className={`clay-canvas ${className ?? ''}`}
      style={{ display: 'block', width: '100%', height: '100%' }}
      onPointerMove={lean}
      onPointerLeave={(event) => (event.currentTarget.style.transform = '')}
      onPointerDown={squash}
      onAnimationEnd={(event) => event.currentTarget.classList.remove('clay-squash')}
    />
  );
}
