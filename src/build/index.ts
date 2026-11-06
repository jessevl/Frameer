/**
 * @file index.ts
 * @description Build helpers for the apps' Vite configs. Import from `@frameer/ui/build` in a `vite.config.ts` only, never from app code.
 * @app SHARED - Generic: needs no dependency on Vite.
 */
export { lazyLucideCatalogue, CATALOGUE_QUERY, type LazyLucideCatalogueOptions, type LazyLucideCataloguePlugin } from "./lazyLucideCatalogue";
