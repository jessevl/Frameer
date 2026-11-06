/**
 * @file router.tsx
 * @description Renders a component inside a memory router (one root route, the given path), for the tests of parts that read the router (AppLink, PillHeader, usePanelStack). Returns the router so a test can read the location and the history.
 * Used by: Frameer's shell tests.
 */
import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';

export async function renderInRouter(ui: ReactNode, path = '/') {
  const router = createRouter({ routeTree: createRootRoute({ component: () => <>{ui}</> }), history: createMemoryHistory({ initialEntries: [path] }) });
  await router.load();
  const view = render(<RouterProvider router={router} />);
  return { router, ...view };
}
