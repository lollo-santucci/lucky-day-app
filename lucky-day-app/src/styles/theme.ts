/**
 * Centralized theme configuration for Lucky Day App
 * Contains colors, typography, spacing, and component styles
 */

export const theme = {
  colors: {
    // Primary Brand Colors
    primary: '#B83330',      // Jade Red
    background: '#FAF6F0',   // Paper Ivory
    surface: '#FFFFFF',      // White
    text: '#222222',         // Ink Black
    accent: '#F2C879',       // Soft Gold
    
    // Semantic Colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#B83330',        // Same as primary for consistency
    info: '#2196F3',
    
    // Neutral Colors
    textSecondary: '#666666',
    textTertiary: '#888888',
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    disabled: '#CCCCCC',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Interactive States
    primaryLight: '#D64A47',
    primaryDark: '#8B2825',
    accentLight: '#F5D699',
    accentDark: '#E6B85C',
  },
  
  typography: {
    // Font Sizes
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
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