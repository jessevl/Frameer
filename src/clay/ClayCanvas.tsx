/**
 * @file ClayCanvas.tsx
 * @description A canvas that holds one clay picture: it follows its box's size and the device's pixel ratio, repaints when the theme changes, and runs on one shared frame loop at about 30 fps, only while it is on screen and only while the picture is alive (`live`) or still settling (the draw returned true). With reduced motion it draws one still frame per change, with every movement already finished. The picture is decoration: hidden from assistive technology.
 * Used by: the apps' picture components (Drift's desk, done pile, boat and empty states).
 */
import { useEffect, useRef } from 'react';
import type { ClayPalette } from './clay';
import { clayPalette, forgetClayPalette } from './clayPalette';

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
}

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
}

export function ClayCanvas({ draw, live = false, className, version }: ClayCanvasProps) {
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
      return drawRef.current(ctx, { w, h, t: reduced ? 0 : now - start, now, reduced, pal: clayPalette() }) === true;
    };
    const scene: Scene = { el, paint, visible: true, live, moving: false };
    sceneRef.current = scene;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      scene.moving = paint();
      kick();
    };
    const sizes = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    sizes?.observe(el);
    scenes.add(scene);
    watch();
    views?.observe(el);
    fit();
    return () => {
      sizes?.disconnect();
      views?.unobserve(el);
      scenes.delete(scene);
      sceneRef.current = null;
    };
  }, [live]);

  // New data, or a new drawing: paint now and let the loop carry any movement it started.
  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;
    s.moving = s.paint();
    kick();
  }, [draw, version]);

  return <canvas ref={ref} aria-hidden="true" data-clay="" className={className} style={{ display: 'block', width: '100%', height: '100%' }} />;
}
