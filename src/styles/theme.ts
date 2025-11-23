/**
 * Centralized theme configuration for Lucky Day App
 * Contains colors, typography, spacing, and component styles
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
  
  spacing: {
    // Base spacing unit (4px)
    unit: 4,
    
    // Spacing scale
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
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

// Type definitions for theme
export type Theme = typeof theme;
export type ThemeColors = keyof typeof theme.colors;
export type ThemeFontSizes = keyof typeof theme.typography.fontSize;
export type ThemeSpacing = keyof typeof theme.spacing;