/**
 * @file index.ts
 * @description The suite's clay engine for house and close-up pictures (Hearth D-2): the engine (stage, light pass, styles), the object library, the house and close-up renderers that draw a plain scene model, and the React wrapper. Import from `@frameer/ui/clay/house` (or `@frameer/clay/house` inside an app). The older clay kit (`@frameer/ui/clay`) is unchanged; apps keep their own pictures until they adopt this engine (Hearth D-3).
 */
export * from './colors';
export * from './styles';
export * from './stage';
export * from './light';
export * from './items';
export * from './house';
export * from './closeup';
export * from './scene';
export * from './HousePicture';
export * as objects from './objects';
