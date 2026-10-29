/**
 * @file LineIcon.tsx
 * @description A Drift line icon: grey outlines of Drift's own shapes in `currentColor`, with the motion kit's gesture when the icon sits inside a button, link, menu row or `.icon-hv` element that is hovered or focused. Always coral for the create button and the sync mark; the current rail section is colored by the rail. `inherit` takes the text color of the button around it (toolbars and menus) instead of the icon grey. Decorative unless it carries an `aria-label` or `role`: the button or row around it carries the name.
 * Used by: the rail, the panes, and `lucide.tsx` (every toolbar, menu and tab icon).
 */
import { useId, useMemo, type SVGProps } from 'react';
import { lineLabel, lineMarkup, type LineName } from './line';

export type { LineName };

type LineIconProps = { name: LineName; size?: number; label?: boolean; inherit?: boolean } & Omit<SVGProps<SVGSVGElement>, 'name' | 'ref' | 'children' | 'dangerouslySetInnerHTML'>;

export function LineIcon({ name, size = 20, label, inherit, className, ...rest }: LineIconProps) {
  const prefix = `ln${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const { inner, fixed } = useMemo(() => lineMarkup(name, prefix, size), [name, prefix, size]);
  const named = label || rest['aria-label'] !== undefined || rest.role !== undefined;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      overflow="visible"
      fill="none"
      data-line={name}
      {...(named ? { role: 'img', 'aria-label': rest['aria-label'] ?? lineLabel(name) } : { 'aria-hidden': true, focusable: false })}
      {...rest}
      className={`gi-line${fixed ? ' gi-fixed' : ''}${inherit ? ' gi-inherit' : ''}${className ? ` ${className}` : ''}`}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
