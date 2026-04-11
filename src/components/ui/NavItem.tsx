'use client';

import React from 'react';
import { cn } from '@frameer/lib/design-system';
import { useIsMobile } from '@frameer/hooks/useMobileDetection';

export interface NavItemProps {
  icon?: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * NavItem - Standardized navigation item for sidebars
 * 
 * @example
 * <NavItem 
 *   icon={<InboxIcon />} 
 *   label="Inbox" 
 *   isActive={currentView === 'inbox'}
 *   badge={<Badge>3</Badge>}
 *   onClick={() => navigateToView('inbox')}
 * />
 */
const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  badge,
  isActive = false,
  onClick,
  className,
  compact = false,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        'group w-full flex items-center',
        compact ? 'gap-2' : 'gap-3',
        // Larger padding on mobile for better touch targets, increased vertical padding
        isMobile ? 'px-4 py-3 text-base' : 'px-3 py-1.5 text-sm',
        'rounded-lg font-medium transition-all text-left',
        
        // Active state - macOS glassy effect
        isActive && 'glass-item text-[var(--color-text-primary)]',
        
        // Inactive state - subtle hover
        !isActive && 'glass-item-subtle text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
        
        // Custom overrides
        className
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon */}
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}

      {/* Label */}
      <span className="flex-1">
        {label}
      </span>

      {/* Badge */}
      {badge && badge}
    </button>
  );
};

export default NavItem;
