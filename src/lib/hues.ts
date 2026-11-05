/**
 * @file hues.ts
 * @description The names of the ten hues (Gray, Brown, Orange, Yellow, Green, Teal, Blue, Purple, Pink, Red) and the CSS variable of each step. The colors themselves are tokens in `styles/hues.css` (`--hue-<name>-<step>`), light and dark. Coral is not a hue: it marks actions and the chosen item only.
 * Based on drift@d91d6950:frontend/src/items/hues.ts (the names and `hueVar`; Drift keeps its table of numbers)
 * Used by: Avatar, the `choices` menu item, and apps that let people color something.
 */

export const HUE_NAMES = ['gray', 'brown', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'red'] as const;
export type HueName = (typeof HUE_NAMES)[number];

export type HueStep = 'fill' | 'stroke' | 'ink' | 'mark';

export function isHueName(value: string): value is HueName {
  return (HUE_NAMES as readonly string[]).includes(value);
}

/** The CSS variable reference of one step of a hue; it follows the theme by itself. */
export function hueVar(name: HueName, step: HueStep): string {
  return `var(--hue-${name}-${step})`;
}
