/**
 * @file scene.ts
 * @description One entry for every clay picture the engine draws: a house (`{ house }`) or a close-up (`{ closeup }`), drawn with the same options (style, time of day, theme, scale or a box to fit).
 * Used by: HousePicture, the apps' picture code, tests.
 */
import { drawCloseup, type CloseupScene } from './closeup';
import { drawHouse, type HouseScene, type Picture, type PictureOptions } from './house';

/** A picture's scene: a house, or a close-up without walls or floors. */
export type ClayScene = { house: HouseScene } | { closeup: CloseupScene };

/** Draws a scene onto a new canvas. */
export function drawScene(scene: ClayScene, o: PictureOptions = {}): Picture {
  return 'house' in scene ? drawHouse(scene.house, o) : drawCloseup(scene.closeup, o);
}
