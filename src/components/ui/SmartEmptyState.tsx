/**
 * @file SmartEmptyState.tsx
 * @description Beautiful empty state components with illustrations and suggestions
 * 
 * Smart, contextual empty states for different views with helpful suggestions.
 */
import React from 'react';
import { cn } from '@frameer/lib/design-system';
import Button from './Button';
import { 
  Inbox, 
  CalendarDays, 
  CalendarRange, 
  CheckCircle2, 
  FileText, 
  Folder, 
  Pencil,
  Sparkles,
  ListTodo,
  Plus,
} from 'lucide-react';

interface SmartEmptyStateProps {
  type: 'inbox' | 'today' | 'upcoming' | 'all' | 'completed' | 'tasks' | 'pages' | 'collection' | 'search' | 'custom';
  /** Custom title (overrides default) */
  title?: string;
  /** Custom description (overrides default) */
  description?: string;
  /** Custom icon (overrides default) */
  icon?: React.ReactNode;
  /** Primary action button */
  actionLabel?: string;
  onAction?: () => void;
  /** Secondary action */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Additional class names */
  className?: string;
}

const emptyStateConfig = {
  inbox: {
    icon: <Inbox className="w-16 h-16" />,
    title: 'Inbox Zero! 🎉',
    description: 'All caught up. Capture tasks here quickly, then organize them later.',
    gradient: 'from-gray-400 to-gray-500',
  },
  today: {
    icon: <CalendarDays className="w-16 h-16" />,
    title: 'Nothing due today',
    description: "You're all clear! Schedule tasks or focus on your long-term goals.",
    gradient: 'from-blue-400 to-blue-500',
  },
  upcoming: {
    icon: <CalendarRange className="w-16 h-16" />,
    title: 'No scheduled tasks',
    description: 'Add due dates to your tasks to see them here and stay organized.',
    gradient: 'from-rose-400 to-red-500',
  },
  all: {
    icon: <ListTodo className="w-16 h-16" />,
    title: 'No tasks yet',
    description: 'Create your first task to get started with organizing your work.',
    gradient: 'from-violet-400 to-purple-500',
  },
  completed: {
    icon: <CheckCircle2 className="w-16 h-16" />,
    title: 'No completed tasks yet',
    description: 'Check off some tasks to see them here. You got this!',
    gradient: 'from-emerald-400 to-green-500',
  },
  tasks: {
    icon: <ListTodo className="w-16 h-16" />,
    title: 'No tasks in this collection',
    description: 'Add tasks to organize work within this task collection.',
    gradient: 'from-violet-400 to-purple-500',
  },
  pages: {
    icon: <FileText className="w-16 h-16" />,
    title: 'No pages yet',
    description: 'Create your first note, collection, or whiteboard to get started.',
    gradient: 'from-cyan-400 to-blue-500',
  },
  collection: {
    icon: <Folder className="w-16 h-16" />,
    title: 'This collection is empty',
    description: 'Add notes, collections, or whiteboards here to organize your content.',
    gradient: 'from-amber-400 to-orange-500',
  },
  search: {
    icon: <Sparkles className="w-16 h-16" />,
    title: 'No results found',
    description: 'Try different search terms or use the command palette to create new items.',
    gradient: 'from-pink-400 to-rose-500',
  },
  custom: {
    icon: <Pencil className="w-16 h-16" />,
    title: 'Nothing here yet',
    description: 'Get started by creating something new.',
    gradient: 'from-gray-400 to-gray-500',
  },
};

export const SmartEmptyState: React.FC<SmartEmptyStateProps> = ({
  type,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  className,
}) => {
  const config = emptyStateConfig[type];
  
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-8 text-center',
      className
    )}>
      {/* Gradient icon container */}
      <div className={cn(
        'relative mb-6 p-6 rounded-3xl',
        'bg-gradient-to-br opacity-80',
        config.gradient
      )}>
        <div className="text-white/90">
          {icon || config.icon}
        </div>
        {/* Subtle glow effect */}
        <div className={cn(
          'absolute inset-0 rounded-3xl blur-2xl opacity-30',
          'bg-gradient-to-br',
          config.gradient
        )} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
        {title || config.title}
      </h3>

      {/* Description */}
      <p className="text-[var(--color-text-secondary)] max-w-sm mb-6">
        {description || config.description}
      </p>

      {/* Actions */}
      {(actionLabel || secondaryLabel) && (
        <div className="flex items-center gap-3">
          {actionLabel && onAction && (
            <Button 
              variant="primary" 
              size="md" 
              onClick={onAction}
              className="gap-2"
            >
              <Plus size={16} />
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && onSecondary && (
            <Button 
              variant="ghost" 
              size="md" 
              onClick={onSecondary}
            >
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Compact empty state for smaller containers
 */
interface CompactEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const CompactEmptyState: React.FC<CompactEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => (
  <div className={cn(
    'flex flex-col items-center justify-center py-8 px-4 text-center',
    className
  )}>
    {icon && (
      <div className="mb-3 text-[var(--color-text-tertiary)]">
        {icon}
      </div>
    )}
    <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
      {title}
    </p>
    {description && (
      <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
        {description}
      </p>
    )}
    {actionLabel && onAction && (
      <Button variant="ghost" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default SmartEmptyState;
