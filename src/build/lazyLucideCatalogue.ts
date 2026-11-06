/**
 * @file lazyLucideCatalogue.ts
 * @description A Vite plugin that keeps the Lucide catalogue out of an app's entry chunk. Frameer's `lib/lucideCatalogue.ts` imports 'lucide-react' dynamically so icons drawn by a runtime name stay lazy, while its chrome icons import the same package statically. One module imported both ways is bundled as one shared chunk that the entry preloads, which put all ~770 KB of icon drawings on the first page load. This plugin gives the dynamic import its own module id (the barrel with a query), so the catalogue becomes a separate chunk; the icon files themselves stay shared, so a statically named icon still costs only its own drawing.
 * The importer is matched by file name, and a production build fails if that import was never seen (Frameer renamed or moved the file) instead of quietly putting the whole catalogue back on the first page load.
 * It runs in production builds only (`apply: 'build'`); the dev server and Vitest use the barrel, where chunking does not matter. The types below are the few parts of Vite's plugin API it uses, so Frameer needs no dependency on Vite; the result is accepted in an app's `plugins` array.
 * @app SHARED - Generic: knows nothing about any app.
 * Ported from yard@frontend/vite.config.ts (also in harbour@frontend/vite.config.ts and drift@frontend/vite.config.ts).
 * Used by: each app's vite.config.ts: `plugins: [lazyLucideCatalogue(), ...]` imported as `./frameer/src/build` where Frameer is a submodule (or `@frameer/ui/build` from the package); a Vite config cannot use the `@frameer` alias.
 */

interface ResolvedId {
  id: string;
}

/** What the plugin calls on Rollup's plugin context. */
interface PluginContext {
  resolve(source: string, importer?: string, options?: Record<string, unknown>): Promise<ResolvedId | null>;
  error(message: string): never;
}

export interface LazyLucideCatalogueOptions {
  /** The plugin's name in Vite's logs. Default `frameer:lazy-lucide-catalogue`. */
  name?: string;
  /** Matches the importing file's path (query removed) that holds the dynamic import. Default: a file named `lucideCatalogue.ts`. */
  importer?: RegExp;
}

export interface LazyLucideCataloguePlugin {
  name: string;
  apply: 'build';
  enforce: 'pre';
  resolveId(this: PluginContext, source: string, importer: string | undefined, options: Record<string, unknown>): Promise<ResolvedId | null>;
  generateBundle(this: PluginContext): void;
}

/** The module id the catalogue import gets: the barrel's own id with a query, so it is a module of its own. */
export const CATALOGUE_QUERY = '?catalogue';

export function lazyLucideCatalogue({ name = 'frameer:lazy-lucide-catalogue', importer: importerPattern = /[/\\]lucideCatalogue[.]ts$/ }: LazyLucideCatalogueOptions = {}): LazyLucideCataloguePlugin {
  let seen = false;
  return {
    name,
    apply: 'build',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (source !== 'lucide-react' || !importer || !importerPattern.test(importer.split('?')[0] ?? '')) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved) return null;
      seen = true;
      return { ...resolved, id: `${resolved.id}${CATALOGUE_QUERY}` };
    },
    generateBundle() {
      if (!seen) this.error(`${name}: no lucide-react import from lucideCatalogue.ts was seen; Frameer moved or renamed it, so the importer pattern must change`);
    },
  };
}
