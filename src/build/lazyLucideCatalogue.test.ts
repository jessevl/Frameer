/**
 * @file lazyLucideCatalogue.test.ts
 * @vitest-environment node
 * @description The Lucide catalogue plugin: it gives only the catalogue's dynamic import its own module id, leaves every other import alone (the chrome icons' static import, other packages), applies to builds only, fails a build that never saw the import, and is accepted as a Vite plugin.
 */
import { describe, expect, it, vi } from 'vitest';
import type { Plugin } from 'vite';
import { lazyLucideCatalogue } from './lazyLucideCatalogue';

function context(resolved: { id: string } | null = { id: '/n/lucide-react/dist/esm/lucide-react.mjs' }) {
  return { resolve: vi.fn(async () => resolved), error: vi.fn((message: string): never => { throw new Error(message); }) };
}

describe('lazyLucideCatalogue', () => {
  it('applies to builds, before other plugins', () => {
    const plugin = lazyLucideCatalogue();
    expect(plugin.apply).toBe('build');
    expect(plugin.enforce).toBe('pre');
  });

  it('is accepted in a Vite plugins array', () => {
    const plugins: Plugin[] = [lazyLucideCatalogue()];
    expect(plugins).toHaveLength(1);
  });

  it('gives the catalogue import the barrel with a query', async () => {
    const plugin = lazyLucideCatalogue();
    const ctx = context();
    const result = await plugin.resolveId.call(ctx, 'lucide-react', '/src/lib/lucideCatalogue.ts', {});
    expect(result?.id).toBe('/n/lucide-react/dist/esm/lucide-react.mjs?catalogue');
    expect(ctx.resolve).toHaveBeenCalledWith('lucide-react', '/src/lib/lucideCatalogue.ts', { skipSelf: true });
  });

  it('matches a Windows path and an importer with a query', async () => {
    const plugin = lazyLucideCatalogue();
    expect((await plugin.resolveId.call(context(), 'lucide-react', 'C:\\x\\lib\\lucideCatalogue.ts?t=1', {}))?.id).toContain('?catalogue');
  });

  it('leaves other importers and other packages alone', async () => {
    const plugin = lazyLucideCatalogue();
    expect(await plugin.resolveId.call(context(), 'lucide-react', '/src/components/ui/ChromeIcons.tsx', {})).toBeNull();
    expect(await plugin.resolveId.call(context(), 'react', '/src/lib/lucideCatalogue.ts', {})).toBeNull();
    expect(await plugin.resolveId.call(context(), 'lucide-react', undefined, {})).toBeNull();
  });

  it('fails the build when the import was never seen, and passes when it was', async () => {
    const quiet = lazyLucideCatalogue({ name: 'app:lucide' });
    expect(() => quiet.generateBundle.call(context())).toThrow('app:lucide');
    const plugin = lazyLucideCatalogue();
    await plugin.resolveId.call(context(), 'lucide-react', '/src/lib/lucideCatalogue.ts', {});
    expect(() => plugin.generateBundle.call(context())).not.toThrow();
  });

  it('takes another importer pattern', async () => {
    const plugin = lazyLucideCatalogue({ importer: /icons\.ts$/ });
    expect((await plugin.resolveId.call(context(), 'lucide-react', '/src/icons.ts', {}))?.id).toContain('?catalogue');
  });

  it('gives up quietly when the package cannot be resolved', async () => {
    const plugin = lazyLucideCatalogue();
    expect(await plugin.resolveId.call(context(null), 'lucide-react', '/src/lib/lucideCatalogue.ts', {})).toBeNull();
  });
});
