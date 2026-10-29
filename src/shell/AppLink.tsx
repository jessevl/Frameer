/**
 * @file AppLink.tsx
 * @description A real `<a href>` that navigates inside the app on a plain click and leaves modified clicks (new tab, download) to the browser.
 * Used by: the rail, the panes and the stage header, wherever the route is only known as a path string.
 */
import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { useRouter } from '@tanstack/react-router';

export function AppLink({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || rest.target === '_blank') return;
    event.preventDefault();
    router.history.push(href);
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}
