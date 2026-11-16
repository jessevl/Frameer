/**
 * @file index.ts
 * @description The object library of the clay engine, for a scene that draws in code (an app's own close-up) instead of through items: every object takes the stage first, then its place and options, and queues itself back to front (or draws at once on a surface).
 * Used by: house/index.ts (as `objects`), the examples.
 */
export * from './effects';
export * from './furniture';
export * from './kitchen';
export * from './light';
export * from './media';
export * from './outdoor';
export * from './people';
export * from './pieces';
export * from './plants';
export * from './rooms';
export * from './utility';
export * from './wall';
