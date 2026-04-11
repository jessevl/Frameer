/**
 * @file useMobileDetection.ts
 * @description Responsive detection hooks for mobile, tablet, and desktop layouts
 * @app SHARED - Core responsive infrastructure
 * 
 * Provides reactive hooks that respond to viewport changes and device capabilities.
 * Uses CSS media queries for accurate, SSR-safe detection.
 * 
 * Breakpoints (aligned with Tailwind):
 * - Mobile: < 768px (md breakpoint)
 * - Tablet: 768px - 1023px
 * - Desktop: >= 1024px (lg breakpoint)
 * 
 * Usage:
 * ```tsx
 * const { isMobile, isTablet, isDesktop, isTouch } = useResponsive();
 * 
 * // Or individual hooks for performance (only subscribes to one query)
 * const isMobile = useIsMobile();
 * ```
 */

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

// ============================================================================
// BREAKPOINTS - Single source of truth, matches tailwind.config.js
// ============================================================================

export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,   // Mobile < md
  tablet: 768,
  lg: 1024,  // Desktop >= lg
  xl: 1280,
  '2xl': 1536,
} as const;

// ============================================================================
// MEDIA QUERY UTILITIES
// ============================================================================

/**
 * Create a media query string for minimum width
 */
const minWidth = (px: number) => `(min-width: ${px}px)`;

/**
 * Create a media query string for maximum width
 */
const maxWidth = (px: number) => `(max-width: ${px - 1}px)`;

/**
 * Create a media query string for a width range
 */
const betweenWidth = (minPx: number, maxPx: number) => 
  `(min-width: ${minPx}px) and (max-width: ${maxPx - 1}px)`;

// Predefined queries
const QUERIES = {
  mobile: maxWidth(BREAKPOINTS.md),           // < 768px
  tablet: betweenWidth(BREAKPOINTS.md, BREAKPOINTS.lg), // 768px - 1023px
  desktop: minWidth(BREAKPOINTS.lg),          // >= 1024px
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
  standalone: '(display-mode: standalone)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
} as const;

// ============================================================================
// CORE HOOK: useMediaQuery
// ============================================================================

/**
 * Subscribe to a CSS media query with SSR-safe behavior.
 * Uses useSyncExternalStore for concurrent-safe subscriptions.
 * 
 * @param query - CSS media query string
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => {
    // Default to mobile-first on server (most restrictive)
    return false;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ============================================================================
// INDIVIDUAL BREAKPOINT HOOKS
// ============================================================================

/**
 * Returns true when viewport is mobile size (< 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery(QUERIES.mobile);
}

/**
 * Returns true when viewport is tablet size (768px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery(QUERIES.tablet);
}

/**
 * Returns true when viewport is desktop size (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(QUERIES.desktop);
}

/**
 * Returns true when device has touch as primary input
 */
export function useIsTouch(): boolean {
  return useMediaQuery(QUERIES.touch);
}

/**
 * Returns true when device has mouse/trackpad as primary input
 */
export function useIsMouse(): boolean {
  return useMediaQuery(QUERIES.mouse);
}

/**
 * Returns true when app is running in Tauri desktop wrapper
 * Detection is synchronous since __TAURI__ is set before any JS runs
 */
export function useIsTauri(): boolean {
  const detectTauri = () => {
    if (typeof window === 'undefined') return false;
    if ('__TAURI__' in window) return true;
    const ua = navigator.userAgent || '';
    return ua.toLowerCase().includes('tauri');
  };

  const [isTauri, setIsTauri] = useState(detectTauri);

  useEffect(() => {
    setIsTauri(detectTauri());
  }, []);

  return isTauri;
}

/**
 * Returns true when app is running in Tauri on macOS
 */
export function useIsTauriMacOS(): boolean {
  const detectTauriMacOS = () => {
    if (typeof window === 'undefined') return false;
    const isTauri = '__TAURI__' in window || (navigator.userAgent || '').toLowerCase().includes('tauri');
    if (!isTauri) return false;
    const platform = (navigator.platform || '').toLowerCase();
    const ua = (navigator.userAgent || '').toLowerCase();
    return platform.includes('mac') || ua.includes('mac os');
  };

  const [isTauriMacOS, setIsTauriMacOS] = useState(detectTauriMacOS);

  useEffect(() => {
    setIsTauriMacOS(detectTauriMacOS());
  }, []);

  return isTauriMacOS;
}

/**
 * Returns true when app is running in standalone mode (installed PWA or Capacitor)
 */
export function useIsStandalone(): boolean {
  return useMediaQuery(QUERIES.standalone);
}

/**
 * Returns true when user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(QUERIES.reducedMotion);
}

// ============================================================================
// COMBINED RESPONSIVE HOOK
// ============================================================================

export interface ResponsiveState {
  /** Viewport < 768px */
  isMobile: boolean;
  /** Viewport 768px - 1023px */
  isTablet: boolean;
  /** Viewport >= 1024px */
  isDesktop: boolean;
  /** Touch is primary input (phones, tablets) */
  isTouch: boolean;
  /** Mouse/trackpad is primary input */
  isMouse: boolean;
  /** Running as installed app (PWA or Capacitor) */
  isStandalone: boolean;
  /** User prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Mobile or tablet (touch-first layout) */
  isMobileOrTablet: boolean;
  /** Current viewport width in pixels */
  viewportWidth: number;
}

/**
 * Comprehensive responsive state hook.
 * 
 * Note: This subscribes to multiple media queries. For components that only
 * need one check, prefer the individual hooks (useIsMobile, etc.) for better performance.
 * 
 * @returns ResponsiveState object with all responsive flags
 */
export function useResponsive(): ResponsiveState {
  const isMobile = useMediaQuery(QUERIES.mobile);
  const isTablet = useMediaQuery(QUERIES.tablet);
  const isDesktop = useMediaQuery(QUERIES.desktop);
  const isTouch = useMediaQuery(QUERIES.touch);
  const isMouse = useMediaQuery(QUERIES.mouse);
  const isStandalone = useMediaQuery(QUERIES.standalone);
  const prefersReducedMotion = useMediaQuery(QUERIES.reducedMotion);
  
  // Viewport width for edge cases where breakpoints aren't enough
  const [viewportWidth, setViewportWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    isMouse,
    isStandalone,
    prefersReducedMotion,
    isMobileOrTablet: isMobile || isTablet,
    viewportWidth,
  };
}

// ============================================================================
// UTILITY: CONDITIONAL RENDERING HELPER
// ============================================================================

/**
 * Returns appropriate value based on current viewport
 * 
 * @example
 * const columns = useResponsiveValue({ mobile: 1, tablet: 2, desktop: 4 });
 */
export function useResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  if (isMobile) return values.mobile;
  if (isTablet) return values.tablet ?? values.mobile;
  return values.desktop ?? values.tablet ?? values.mobile;
}

// ============================================================================
// SIDEBAR STATE HOOK (for mobile drawer behavior)
// ============================================================================

/**
 * Manages sidebar visibility state with responsive defaults.
 * - Desktop: sidebar visible by default
 * - Mobile/Tablet: sidebar hidden by default (drawer mode)
 * 
 * @returns [isOpen, toggle, open, close]
 */
export function useSidebarState(): [
  boolean, 
  () => void, 
  () => void, 
  () => void
] {
  const isDesktop = useIsDesktop();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-close sidebar when switching from desktop to mobile
  useEffect(() => {
    if (!isDesktop) {
      setIsOpen(false);
    }
  }, [isDesktop]);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // On desktop, sidebar is always "open" (visible)
  const effectiveIsOpen = isDesktop ? true : isOpen;

  return [effectiveIsOpen, toggle, open, close];
}

// ============================================================================
// KEYBOARD VISIBILITY HOOK (for mobile keyboard handling)
// ============================================================================

export interface KeyboardState {
  /** Whether the virtual keyboard is visible */
  isKeyboardOpen: boolean;
  /** Height of the keyboard in pixels (0 if not visible) */
  keyboardHeight: number;
}

/**
 * Detects when the mobile virtual keyboard is open using the Visual Viewport API.
 * This is essential for positioning elements like FABs above the keyboard.
 * 
 * @returns KeyboardState object with keyboard visibility and height
 */
export function useKeyboardVisibility(): KeyboardState {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isKeyboardOpen: false,
    keyboardHeight: 0,
  });
  
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }
    
    const viewport = window.visualViewport;
    
    const handleResize = () => {
      // The keyboard is considered open when the visual viewport height
      // is significantly smaller than the window height
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const heightDiff = windowHeight - viewportHeight;
      
      // Consider keyboard open if viewport is more than 150px smaller than window
      // (accounts for address bar changes vs actual keyboard)
      const isOpen = heightDiff > 150;
      
      setKeyboardState({
        isKeyboardOpen: isOpen,
        keyboardHeight: isOpen ? heightDiff : 0,
      });
    };
    
    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);
    
    // Initial check
    handleResize();
    
    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);
  
  return keyboardState;
}
