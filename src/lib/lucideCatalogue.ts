/**
 * @file lucideCatalogue.ts
 * @description Loads the whole Lucide catalogue on demand, so icons that are drawn by a runtime name (an item's chosen icon, the icon picker's grid) do not put some 200 KB of icon drawings into an app's entry chunk. The first caller starts one dynamic import; every later caller shares it. Icons an app names in code keep their own static imports and stay out of this chunk.
 * @app SHARED - Generic: knows nothing about any app.
 * Used by: LucideIcon, IconPicker, and apps that draw Lucide icons by name.
 */
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

export type LucideCatalogue = Readonly<Record<string, LucideIcon | undefined>>;

let loaded: LucideCatalogue | null = null;
let pending: Promise<LucideCatalogue> | null = null;

/** Starts (once) and returns the load of the catalogue. */
export function loadLucideCatalogue(): Promise<LucideCatalogue> {
  pending ??= import('lucide-react').then((module) => {
    // The module namespace is indexed by a runtime name, which its types cannot know.
    loaded = module as unknown as LucideCatalogue;
    return loaded;
  });
  return pending;
}

/** The icon with this PascalCase name once the catalogue is in, else undefined (still loading, or no such icon). */
export function lucideIconByName(catalogue: LucideCatalogue | null, name: string): LucideIcon | undefined {
  const found = catalogue?.[name];
  return typeof found === 'function' || (typeof found === 'object' && found !== null) ? found : undefined;
}

/** The catalogue, or null while it loads. `enabled` false never starts the load (callers that may not need an icon at all). */
export function useLucideCatalogue(enabled = true): LucideCatalogue | null {
  const [catalogue, setCatalogue] = useState<LucideCatalogue | null>(loaded);
  useEffect(() => {
    if (!enabled || catalogue) return;
    let live = true;
    void loadLucideCatalogue().then((next) => {
      if (live) setCatalogue(next);
    });
    return () => {
      live = false;
    };
  }, [enabled, catalogue]);
  return catalogue ?? (enabled ? loaded : null);
}

/** Lucide icon names are PascalCase words; anything else is shown as text (an emoji). */
export function isLucideName(icon: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(icon);
}
