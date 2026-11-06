/**
 * @file panelStack.ts
 * @description The side panel's stack in the address: a view opens a sub-view by adding its id to a query parameter (`?day=2026-11-12&edit=swap`, or `edit=a,b` two deep), and Back takes the last id off, so a link, a reload and the browser's Back all land on the same view. These are the pure parts (parse, push, pop, and the validator routes use to keep the parameter); `usePanelStack` drives them from the router. The parameter name is the app's (`param`, default `edit`).
 * Used by: usePanelStack, and the apps' route search validators (`panelSearch`).
 */
export const PANEL_PARAM = 'edit';

const ID = /^[a-z][a-z0-9-]{0,31}$/;

/** The sub-view ids of a value from the address, outermost first; anything that is not an id is dropped. */
export function parsePanelStack(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value.split(',').filter((id) => ID.test(id));
}

/** The route search validators keep the stack through this: `{ [param]: 'a,b' }` or nothing. */
export function panelSearch(search: Record<string, unknown>, param = PANEL_PARAM): Record<string, string> {
  const stack = parsePanelStack(search[param]);
  return stack.length > 0 ? { [param]: stack.join(',') } : {};
}

function withStack(searchStr: string, stack: readonly string[], param: string): string {
  const params = new URLSearchParams(searchStr);
  if (stack.length > 0) params.set(param, stack.join(','));
  else params.delete(param);
  return params.toString();
}

/** The query string (no leading `?`) with `id` pushed on the stack of `searchStr`; the other parameters are kept. */
export function pushedSearch(searchStr: string, id: string, param = PANEL_PARAM): string {
  const stack = parsePanelStack(new URLSearchParams(searchStr).get(param));
  return withStack(searchStr, ID.test(id) ? [...stack, id] : stack, param);
}

/** The query string with the last id taken off the stack. */
export function poppedSearch(searchStr: string, param = PANEL_PARAM): string {
  return withStack(searchStr, parsePanelStack(new URLSearchParams(searchStr).get(param)).slice(0, -1), param);
}
