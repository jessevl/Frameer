/**
 * @file HousePicture.tsx
 * @description A house or close-up clay picture in its box: draws the scene on Frameer's `ClayCanvas`, fitted and centred, at the device's pixel ratio, in the theme of where it is (coral from the tokens, the dark theme's dimmer light), and draws again when the scene, the style, the time of day, the size or the theme changes. `live` keeps the frame loop running for a scene that moves (its `draw` reads the frame time); with reduced motion it stays a still. `onMarks` reports where named things are, in the box's CSS pixels, when they move. The canvas is decoration (`aria-hidden`); wrap it in a `PictureBox` with a `label` when it stands for a screen.
 * Used by: the apps' house and close-up pictures (Hearth first; the other apps after D-3).
 */
import { useCallback, useEffect, useRef } from 'react';
import { ClayCanvas, type ClayDraw } from '../ClayCanvas';
import { drawScene, type ClayScene } from './scene';
import type { TimeOfDay } from './stage';
import type { StyleName } from './styles';

export interface HousePictureProps {
  scene: ClayScene;
  /** The style; G (`half`) by default. */
  style?: StyleName;
  time?: TimeOfDay;
  /** Padding inside the box, CSS pixels. */
  pad?: number;
  /** Keeps drawing every frame while visible, for scenes that move. */
  live?: boolean;
  className?: string;
  /** Where named things are (`marks`), in the box's CSS pixels; called when they change. */
  onMarks?: (marks: Record<string, [number, number]>) => void;
}

export function HousePicture({ scene, style, time, pad, live = false, className, onMarks }: HousePictureProps) {
  const lastMarks = useRef('');
  const marksRef = useRef(onMarks);
  useEffect(() => {
    marksRef.current = onMarks;
  }, [onMarks]);
  const draw = useCallback<ClayDraw>(
    (ctx, f) => {
      const dpr = f.w ? ctx.canvas.width / f.w : 1;
      const pic = drawScene(scene, { style, time, pad, dark: f.pal.dark, palette: f.pal, fit: { w: f.w, h: f.h }, dpr, t: f.t });
      ctx.drawImage(pic.canvas, 0, 0, f.w, f.h);
      const key = JSON.stringify(pic.marks);
      if (key !== lastMarks.current) {
        lastMarks.current = key;
        marksRef.current?.(pic.marks);
      }
      return false;
    },
    [scene, style, time, pad],
  );
  return <ClayCanvas draw={draw} live={live} alive={false} className={className} version={scene} />;
}
