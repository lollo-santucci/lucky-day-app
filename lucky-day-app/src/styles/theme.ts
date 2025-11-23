/**
 * Design Token System for Lucky Day App
 * Comprehensive design tokens including colors, typography, spacing, and layout constants
 * Based on Chinese-inspired aesthetic requirements
 */

export const theme = {
  colors: {
    // Primary Brand Colors (Updated from Figma)
    primary: '#F04B16',      // Orange Red
    background: '#FFF6E4',   // Light Yellow
    surface: '#FFFFFF',      // White
    text: '#222222',         // Primary Text (Dark Gray)
    accent: '#00BF63',       // Green Accent
    secondary: '#FFB5B1',    // Light Pink Secondary
    
    // Text Colors (From Figma)
    textPrimary: '#222222',     // Primary text color
    textSecondary: '#8B4B62',   // Secondary text color (muted purple)
    textWarning: '#F78A59',     // Warning text color (orange)
    
    // Semantic Colors
    success: '#00BF63',      // Use accent green for success
    warning: '#F78A59',      // Use warning text color
    error: '#F04B16',        // Use primary for errors
    info: '#2196F3',
    
    // Neutral Colors
    textTertiary: '#888888',
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    disabled: '#CCCCCC',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Interactive States (Generated from new colors)
    primaryLight: '#F26B3A',    // Lighter version of primary
    primaryDark: '#D63E12',     // Darker version of primary
    accentLight: '#33CC7F',     // Lighter version of accent
    accentDark: '#00A055',      // Darker version of accent
    secondaryLight: '#FFC7C4',  // Lighter version of secondary
    secondaryDark: '#FF9B96',   // Darker version of secondary
  },
  
  typography: {
    // Font Families
    fontFamily: {
      // System fonts (fallbacks)
      system: 'System',
      
      // OpenSauceOne custom fonts
      light: 'OpenSauceOne-Light',
      regular: 'OpenSauceOne-Regular',
      semibold: 'OpenSauceOne-SemiBold',
      bold: 'OpenSauceOne-Bold',
      
      // Semantic font names
      primary: 'OpenSauceOne-Regular',
      primaryLight: 'OpenSauceOne-Light',
      primaryBold: 'OpenSauceOne-Bold',
      
      // Default font family
      default: 'OpenSauceOne-Regular',
    },
    
    // Font Sizes
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '1.5xl': 22,
      '2xl': 24,
      '2.5xl': 26,
      '3xl': 28,
      '4xl': 32,
      '5xl': 36,
    },
    
    // Font Weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
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