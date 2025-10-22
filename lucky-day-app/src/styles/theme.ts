/**
 * Design Token System for Lucky Day App
 * Comprehensive design tokens including colors, typography, spacing, and layout constants
 * Based on Chinese-inspired aesthetic requirements
 */

/**
 * Core Color Palette
 * Based on requirement 6.1: Jade Red, Soft Gold, Paper Ivory, Ink Black
 */
export const colors = {
  // Primary Brand Colors (Requirement 6.1)
  jadeRed: '#B83330',      // Primary brand color
  softGold: '#F2C879',     // Accent and highlight color
  paperIvory: '#FAF6F0',   // Background and surface color
  inkBlack: '#222222',     // Primary text color
  
  // Semantic Color Mapping
  primary: '#B83330',      // Jade Red
  secondary: '#F2C879',    // Soft Gold
  background: '#FAF6F0',   // Paper Ivory
  surface: '#FFFFFF',      // Pure white for cards/modals
  text: '#222222',         // Ink Black
  
  // Interactive States
  primaryHover: '#D64A47',    // Lighter jade red
  primaryPressed: '#8B2825',  // Darker jade red
  secondaryHover: '#F5D699',  // Lighter soft gold
  secondaryPressed: '#E6B85C', // Darker soft gold
  
  // Semantic Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#B83330',        // Use jade red for consistency
  info: '#2196F3',
  
  // Neutral Grays
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Text Colors
  textPrimary: '#222222',     // Ink Black
  textSecondary: '#666666',   // Medium gray
  textTertiary: '#888888',    // Light gray
  textDisabled: '#CCCCCC',    // Very light gray
  textInverse: '#FFFFFF',     // White text on dark backgrounds
  
  // Border Colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  
  // Overlay Colors
  overlay: 'rgba(34, 34, 34, 0.5)',      // Semi-transparent ink black
  overlayLight: 'rgba(34, 34, 34, 0.3)',
  overlayDark: 'rgba(34, 34, 34, 0.7)',
  
  // Legacy color aliases for backward compatibility
  accent: '#F2C879',        // Maps to softGold
  accentLight: '#F5D699',   // Maps to secondaryHover
  accentDark: '#E6B85C',    // Maps to secondaryPressed
  disabled: '#CCCCCC',      // Maps to textDisabled
} as const;

/**
 * Typography System
 * Based on requirements 6.2 and 6.3: Noto Sans/Satoshi primary, decorative fonts for Chinese elements
 */
export const typography = {
  // Font Families (Requirement 6.2, 6.3)
  fontFamily: {
    primary: 'Noto Sans',           // Primary font - clean and readable
    primaryAlt: 'Satoshi',          // Alternative primary font
    decorative: 'HanWangKaiMediumChuIn', // Chinese decorative elements
    decorativeAlt: 'ZCOOL XiaoWei', // Alternative decorative font
    system: 'System',              // System fallback
  },
  
  // Font Sizes (8px base scale)
  fontSize: {
    xs: 10,      // Extra small text
    sm: 12,      // Small text, captions
    base: 14,    // Base body text
    md: 16,      // Medium text, buttons
    lg: 18,      // Large text, subheadings
    xl: 20,      // Extra large text
    '2xl': 24,   // Headings
    '3xl': 28,   // Large headings
    '4xl': 32,   // Display text
    '5xl': 36,   // Large display text
    '6xl': 42,   // Extra large display
    '7xl': 48,   // Hero text
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line Heights (relative to font size)
  lineHeight: {
    tight: 1.2,     // Tight spacing for headings
    snug: 1.3,      // Slightly tight
    normal: 1.4,    // Normal reading
    relaxed: 1.6,   // Relaxed reading
    loose: 1.8,     // Loose spacing
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;

/**
 * Spacing System
 * 4px base unit with consistent scale
 */
export const spacing = {
  // Base unit (4px)
  unit: 4,
  
  // Spacing Scale (4px increments)
  0: 0,
  1: 4,      // xs
  2: 8,      // sm
  3: 12,     // md
  4: 16,     // base
  5: 20,     // lg
  6: 24,     // xl
  8: 32,     // 2xl
  10: 40,    // 3xl
  12: 48,    // 4xl
  16: 64,    // 5xl
  20: 80,    // 6xl
  24: 96,    // 7xl
  
  // Named spacing for common use cases
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
  '7xl': 96,
} as const;

/**
 * Layout Constants
 * Screen dimensions, breakpoints, and layout utilities
 */
export const layout = {
  // Container Widths
  container: {
    sm: 320,    // Small phones
    md: 375,    // Medium phones
    lg: 414,    // Large phones
    xl: 768,    // Tablets
  },
  
  // Screen Margins
  screenMargin: {
    horizontal: 16,  // Standard horizontal margin
    vertical: 20,    // Standard vertical margin
  },
  
  // Component Dimensions
  button: {
    height: {
      sm: 32,
      md: 44,
      lg: 56,
    },
    minWidth: 88,
  },
  
  input: {
    height: 44,
    minHeight: 44,
  },
  
  // Hit Targets (minimum touch area)
  hitTarget: {
    min: 44,     // Minimum touch target size
    comfortable: 48,
  },
} as const;

/**
 * Border Radius System
 */
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

/**
 * Shadow System
 * Consistent elevation shadows for depth
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.inkBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.inkBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.inkBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.inkBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.inkBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

/**
 * Animation Constants
 * Consistent timing and easing for smooth animations (Requirement 6.4)
 */
export const animation = {
  // Duration (in milliseconds)
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  
  // Easing curves
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

/**
 * Combined Theme Object
 * Main theme export containing all design tokens
 */
export const theme = {
  colors,
  typography,
  spacing,
  layout,
  borderRadius,
  shadows,
  animation,
} as const;

// Type definitions for theme
export type Theme = typeof theme;
export type ThemeColors = keyof typeof theme.colors;
export type ThemeFontSizes = keyof typeof theme.typography.fontSize;
export type ThemeSpacing = keyof typeof theme.spacing;