/**
 * @file axe.ts
 * @description Runs axe-core on a rendered tree in jsdom and returns the violations, for the accessibility checks of Frameer's component tests. Colour contrast is left to the browser tests (jsdom draws nothing).
 * Used by: Frameer's component tests.
 */
import axe from 'axe-core';

export async function axeViolations(root: Element = document.body): Promise<string[]> {
  const result = await axe.run(root, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}
