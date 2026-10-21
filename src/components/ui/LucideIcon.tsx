'use client';

/**
 * @file LucideIcon.tsx
 * @description Render a Lucide icon by name with consistent styling
 * @app SHARED - Used wherever icons need to be rendered by name string
 * 
 * This component allows rendering Lucide icons dynamically by their name.
 * Used in conjunction with IconPicker for displaying selected icons.
 * 
 * Standard stroke width (1.75) is applied for visual consistency.
 * The Lucide catalogue loads on demand (lib/lucideCatalogue.ts), so the icon appears a moment after first use.
 */
import React from 'react';
import { chromeClass, useChromeIconStyle } from './ChromeIcons';
import { ICON_STROKE_WIDTH } from '@frameer/lib/iconUtils';
import { lucideIconByName, useLucideCatalogue } from '@frameer/lib/lucideCatalogue';

export interface LucideIconProps {
  /** The name of the Lucide icon (e.g., 'Star', 'Heart', 'Folder') */
  name: string;
  /** CSS class for styling */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Size shorthand (applies to both width and height) */
  size?: number;
  /** Stroke width - defaults to standard (1.75) */
  strokeWidth?: number;
}

/**
 * LucideIcon - Render a Lucide icon by name with consistent styling
 * 
 * @example
 * <LucideIcon name="Star" className="w-5 h-5 text-yellow-500" />
 * <LucideIcon name="Folder" style={{ color: '#3b82f6' }} />
 */
const LucideIcon: React.FC<LucideIconProps> = ({
  name,
  className,
  style,
  size,
  strokeWidth = ICON_STROKE_WIDTH,
}) => {
  const iconStyle = useChromeIconStyle();
  const catalogue = useLucideCatalogue();

  // Until the catalogue is in, an empty svg of the same size holds the place, so nothing shifts when the drawing arrives.
  if (!catalogue) {
    return <svg className={chromeClass(iconStyle, className)} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" />;
  }

  const IconComponent = lucideIconByName(catalogue, name);

  if (!IconComponent) {
    // Fallback to a default icon or null
    return null;
  }

  return (
    <IconComponent 
      className={chromeClass(iconStyle, className)} 
      style={style}
      width={size}
      height={size}
      strokeWidth={iconStyle.strokeWidth ?? strokeWidth}
      fill="currentColor"
      fillOpacity={0.1}
    />
  );
};

export default LucideIcon;
