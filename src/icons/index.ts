/**
 * @file index.ts
 * @description The glass and line icon kit shared by Drift and Yard: the drawing code (palette, glass, kinds, draw, line) and the React components that draw it (GlassIcon, LineIcon, SectionPicture). The drawing files are plain strings and run in Node too (app-icon scripts import them by path, with their .ts extension).
 * @app SHARED - Generic: knows nothing about any app; an app adds its own line icons with registerLineIcons.
 */
export { GlassIcon } from "./GlassIcon";
export { LineIcon, type LineName } from "./LineIcon";
export { SectionPicture } from "./SectionPicture";
export { registerLineIcons, type ExtraLineNames, type LineDef, type LineKit } from "./line";
export { KIND_ART, SECTION_ART, type KindKey, type SectionKey } from "./kinds";
export { paletteOf, type Palette } from "./palette";
