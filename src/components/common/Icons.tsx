/**
 * @file Icons.tsx
 * @description SVG icon components used throughout the application
 * @app SHARED - Used by both Tasks App and Notes App
 * 
 * This file contains all SVG icon components rendered inline for optimal performance.
 * Icons are organized by their primary use case but can be used anywhere.
 * 
 * Icon categories:
 * - Navigation: HomeIcon, SidebarIcon, ChevronIcons, etc.
 * - Tasks: CheckIcon, TodayIcon, InboxIcon, AllTasksIcon, etc.
 * - Pages: PagesIcon, CalendarIcon, CollectionIcon, etc.
 * - Actions: PlusIcon, TrashIcon, EditIcon, MoreHorizontalIcon, etc.
 * - Priority: FlagIcon and priority-related icons
 * 
 * All icons accept a `className` prop for styling with Tailwind.
 * Every icon but the journal calendar (which prints the day's number) is drawn through `ChromeIcon`: a Drift line drawing by default, which an app's `ChromeIconsProvider` can swap for its own.
 */
import React from 'react';
import { ChromeIcon } from '../ui/ChromeIcons';

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="home" className={className} />;

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="settings" className={className} />;

export const SidebarIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="sidebar" className={className} />;

export const AllTasksIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="allTasks" className={className} />;

export const InboxIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="inbox" className={className} />;

export const TodayIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="today" className={className} />;

export const UpcomingIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="upcoming" className={className} />;

export const CompletedIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="completed" className={className} />;

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="chevronRight" className={className} />;

export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="chevronLeft" className={className} />;

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="chevronDown" className={className} />;

export const XIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="close" className={className} />;

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="plus" className={className} />;

export const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="calendarDays" className={className} />;

/** Calendar icon with the current date number displayed inside */
export const JournalCalendarIcon: React.FC<{ className?: string; date?: number }> = ({ className, date }) => {
  const dayNumber = date ?? new Date().getDate();
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
      <path d="M16 3v4M8 3v4" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="9"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {dayNumber}
      </text>
    </svg>
  );
};

export const FlagIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="flag" className={className} />;

export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="close" className={className} />;

export const ClockIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="clock" className={className} />;

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="check" className={className} />;

export const ListViewIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="listView" className={className} />;

export const KanbanViewIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="kanbanView" className={className} />;

export const TableViewIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="tableView" className={className} />;

/** Split view / Reader view icon - shows two panels side by side with content preview */
export const SplitViewIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="splitView" className={className} />;

export const ViewSwitcherIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="viewSwitcher" className={className} />;

export const PagesIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="fileText" className={className} />;

// Alias for backward compatibility
export const NotesIcon = PagesIcon;

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="user" className={className} />;

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="trash" className={className} />;

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="pencil" className={className} />;

export const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="fileText" className={className} />;

export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="arrowRight" className={className} />;

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="arrowLeft" className={className} />;

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="search" className={className} />;

// Collection icon - stacked pages style (for pages and cards)
export const CollectionIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="collection" className={className} />;

// Sidebar collection icon - 4 dots in 2x2 grid (fits between chevrons in sidebar)
export const SidebarCollectionIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="cardView" className={className} />;

// Sort icon - for sorting options
export const SortIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="sort" className={className} />;

// View options/settings icon - horizontal sliders
export const ViewOptionsIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="viewOptions" className={className} />;

// Layout icon - for view options
export const LayoutIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="layout" className={className} />;

// Filter icon - funnel shape
export const FilterIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="filter" className={className} />;

// Card view icon (grid layout)
export const CardViewIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="cardView" className={className} />;

// More horizontal icon (three dots)
export const MoreHorizontalIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="more" className={className} />;

// Play icon for media/timer controls
export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="play" className={className} />;

// Pause icon for media/timer controls
export const PauseIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="pause" className={className} />;

// Skip forward icon
export const SkipIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="skip" className={className} />;

// Timer/stopwatch icon
export const TimerIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="timer" className={className} />;

// Chart/analytics icon for productivity dashboard
export const ChartIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="chart" className={className} />;

// Subtask/checklist icon - list with checkmarks
export const ListChecksIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="listChecks" className={className} />;

// Repeat icon for recurring tasks
export const RepeatIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="repeat" className={className} />;

// ============================================================================
// EDITOR BLOCK ICONS
// ============================================================================

// Type/Text icon - paragraph marker
export const TypeIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="type" className={className} />;

// Quote icon
export const QuoteIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="quote" className={className} />;

// Code icon
export const CodeIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="code" className={className} />;

// Minus/Divider icon
export const MinusIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="minus" className={className} />;

// Image icon
export const ImageIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="image" className={className} />;

// Video icon
export const VideoIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="video" className={className} />;

// Paperclip/File icon
export const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="paperclip" className={className} />;

// Link icon
export const LinkIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="link" className={className} />;

// External Link / Embed icon
export const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="externalLink" className={className} />;

// Table icon
export const TableIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="table" className={className} />;

// ChevronRight for accordion - already exists as ChevronRightIcon

// Pin/Internal Link icon
export const PinIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="pin" className={className} />;

// Lightbulb/Callout icon
export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="lightbulb" className={className} />;

// Whiteboard/Canvas icon - pencil drawing on canvas
export const WhiteboardIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="whiteboard" className={className} />;

// Menu/Hamburger icon - three horizontal lines
export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="menu" className={className} />;

// Text Format icon - stylized 'Aa' for text formatting
export const TextFormatIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="textFormat" className={className} />;

// ============================================================================
// TEXT FORMATTING ICONS - For rich text editor toolbar
// ============================================================================

// Bold icon - letter B
export const BoldIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="bold" className={className} />;

// Italic icon - slanted letter I
export const ItalicIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="italic" className={className} />;

// Underline icon - letter U with underline
export const UnderlineIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="underline" className={className} />;

// Strikethrough icon - letter S with line through
export const StrikethroughIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="strikethrough" className={className} />;

// Align Left icon
export const AlignLeftIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="alignLeft" className={className} />;

// Align Center icon
export const AlignCenterIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="alignCenter" className={className} />;

// Align Right icon
export const AlignRightIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="alignRight" className={className} />;

// Highlighter icon - marker/pen
export const HighlighterIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="highlighter" className={className} />;

// Loader/Spinner icon
export const LoaderIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="loader" className={className} />;

// Upload icon
export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="upload" className={className} />;

// Hash icon (for headings/TOC)
export const HashIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="hash" className={className} />;

// Download icon
export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="download" className={className} />;

// Table of Contents icon - hierarchical outline list
export const TableOfContentsIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="tableOfContents" className={className} />;

// Bookmark icon - for link bookmarks
export const BookmarkIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="bookmark" className={className} />;

// Microphone icon - for voice transcription
export const MicIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="mic" className={className} />;

// Reading Pane / Three-column layout icon
export const ReadingPaneIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="readingPane" className={className} />;

// Reading Pane Off icon (two-column layout)
export const ReadingPaneOffIcon: React.FC<{ className?: string }> = ({ className }) => <ChromeIcon name="readingPaneOff" className={className} />;

// Named exports only — avoid default object export to satisfy lint rules
