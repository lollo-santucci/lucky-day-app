/**
 * Design Token Utilities
 * Helper functions and utilities for consistent styling across the app
 */

import { theme } from './theme';
import { ViewStyle, TextStyle } from 'react-native';

/**
 * Spacing Utilities
 * Helper functions for consistent spacing
 */
export const spacing = {
  /**
   * Get spacing value by key or multiply base unit
   */
  get: (value: keyof typeof theme.spacing | number): number => {
    if (typeof value === 'number') {
      return value * theme.spacing.unit;
    }
    return theme.spacing[value];
  },
  
  /**
   * Create margin styles
   */
  margin: {
    all: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      margin: spacing.get(value),
    }),
    horizontal: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      marginHorizontal: spacing.get(value),
    }),
    vertical: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      marginVertical: spacing.get(value),
    }),
    top: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      marginTop: spacing.get(value),
    }),
    bottom: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      marginBottom: spacing.get(value),
    }),
    left: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      marginLeft: spacing.get(value),
    }),
    right: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      marginRight: spacing.get(value),
    }),
  },
  
  /**
   * Create padding styles
   */
  padding: {
    all: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      padding: spacing.get(value),
    }),
    horizontal: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      paddingHorizontal: spacing.get(value),
    }),
    vertical: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      paddingVertical: spacing.get(value),
    }),
    top: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      paddingTop: spacing.get(value),
    }),
    bottom: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      paddingBottom: spacing.get(value),
    }),
    left: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      paddingLeft: spacing.get(value),
    }),
    right: (value: keyof typeof theme.spacing | number): ViewStyle => ({
      paddingRight: spacing.get(value),
    }),
  },
};

/**
 * Typography Utilities
 * Helper functions for consistent text styling
 */
export const typography = {
  /**
   * Create text style with theme typography
   */
  create: (options: {
    size?: keyof typeof theme.typography.fontSize;
    weight?: keyof typeof theme.typography.fontWeight;
    lineHeight?: keyof typeof theme.typography.lineHeight;
    family?: keyof typeof theme.typography.fontFamily;
    color?: keyof typeof theme.colors;
    letterSpacing?: keyof typeof theme.typography.letterSpacing;
  }): TextStyle => ({
    fontSize: options.size ? theme.typography.fontSize[options.size] : theme.typography.fontSize.base,
    fontWeight: options.weight ? theme.typography.fontWeight[options.weight] : theme.typography.fontWeight.normal,
    lineHeight: options.lineHeight ? 
      (options.size ? theme.typography.fontSize[options.size] : theme.typography.fontSize.base) * 
      theme.typography.lineHeight[options.lineHeight] : 
      undefined,
    fontFamily: options.family ? theme.typography.fontFamily[options.family] : theme.typography.fontFamily.primary,
    color: options.color ? theme.colors[options.color] : theme.colors.textPrimary,
    letterSpacing: options.letterSpacing ? theme.typography.letterSpacing[options.letterSpacing] : undefined,
  }),
  
  /**
   * Predefined text styles for common use cases
   */
  styles: {
    // Headings
    h1: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight,
      color: theme.colors.textPrimary,
    } as TextStyle,
    
    h2: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.fontSize['3xl'] * theme.typography.lineHeight.tight,
      color: theme.colors.textPrimary,
    } as TextStyle,
    
    h3: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.snug,
      color: theme.colors.textPrimary,
    } as TextStyle,
    
    h4: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.snug,
      color: theme.colors.textPrimary,
    } as TextStyle,
    
    // Body text
    body: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
      color: theme.colors.textPrimary,
    } as TextStyle,
    
    bodyLarge: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.normal,
      color: theme.colors.textPrimary,
    } as TextStyle,
    
    bodySmall: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
      color: theme.colors.textSecondary,
    } as TextStyle,
    
    // Special styles
    caption: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
      color: theme.colors.textTertiary,
    } as TextStyle,
    
    button: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.tight,
      color: theme.colors.textInverse,
    } as TextStyle,
    
    // Decorative styles for Chinese elements (Requirement 6.3)
    decorative: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.decorative,
      fontWeight: theme.typography.fontWeight.normal,
      color: theme.colors.primary,
    } as TextStyle,
    
    signature: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.decorativeAlt,
      fontWeight: theme.typography.fontWeight.light,
      color: theme.colors.textSecondary,
    } as TextStyle,
  },
};

/**
 * Color Utilities
 * Helper functions for working with colors
 */
export const colorUtils = {
  /**
   * Get color value by key
   */
  get: (colorKey: keyof typeof theme.colors): string => {
    return theme.colors[colorKey];
  },
  
  /**
   * Create color with opacity
   */
  withOpacity: (colorKey: keyof typeof theme.colors, opacity: number): string => {
    const color = theme.colors[colorKey];
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
};

/**
 * Layout Utilities
 * Helper functions for consistent layouts
 */
export const layoutUtils = {
  /**
   * Create container styles
   */
  container: (options?: {
    horizontal?: boolean;
    vertical?: boolean;
  }): ViewStyle => ({
    paddingHorizontal: options?.horizontal !== false ? theme.layout.screenMargin.horizontal : 0,
    paddingVertical: options?.vertical !== false ? theme.layout.screenMargin.vertical : 0,
  }),
  
  /**
   * Create flex utilities
   */
  flex: {
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,
    
    column: {
      flexDirection: 'column',
    } as ViewStyle,
    
    spaceBetween: {
      justifyContent: 'space-between',
    } as ViewStyle,
    
    spaceAround: {
      justifyContent: 'space-around',
    } as ViewStyle,
  },
  
  /**
   * Create border radius styles
   */
  borderRadius: (value: keyof typeof theme.borderRadius): ViewStyle => ({
    borderRadius: theme.borderRadius[value],
  }),
  
  /**
   * Create shadow styles
   */
  shadow: (level: keyof typeof theme.shadows): ViewStyle => ({
    ...theme.shadows[level],
  }),
};

/**
 * Component Style Generators
 * Pre-built style generators for common components
 */
export const componentStyles = {
  /**
   * Button style generator
   */
  button: (variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary'): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: theme.layout.button.height.md,
      minWidth: theme.layout.button.minWidth,
      borderRadius: theme.borderRadius.base,
      justifyContent: 'center',
      alignItems: 'center',
      ...spacing.padding.horizontal('base'),
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
          ...layoutUtils.shadow('sm'),
        };
      
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.secondary,
          ...layoutUtils.shadow('sm'),
        };
      
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      
      default:
        return baseStyle;
    }
  },
  
  /**
   * Input style generator
   */
  input: (): ViewStyle => ({
    height: theme.layout.input.height,
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...spacing.padding.horizontal('base'),
  }),
  
  /**
   * Card style generator
   */
  card: (elevated: boolean = true): ViewStyle => ({
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...spacing.padding.all('base'),
    ...(elevated ? layoutUtils.shadow('md') : {}),
  }),
  
  /**
   * Input container style
   */
  inputContainer: {
    marginBottom: theme.spacing.base,
  } as ViewStyle,
  
  /**
   * Section title style
   */
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  } as ViewStyle,
  
  /**
   * Error text style
   */
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  } as ViewStyle,
  
  /**
   * Caption text style
   */
  captionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  } as ViewStyle,
};

/**
 * Responsive Utilities
 * Helper functions for responsive design
 */
export const responsive = {
  /**
   * Get responsive value based on screen width
   */
  getValue: <T>(values: { sm?: T; md?: T; lg?: T; xl?: T }, screenWidth: number, fallback: T): T => {
    if (screenWidth >= theme.layout.container.xl && values.xl !== undefined) return values.xl;
    if (screenWidth >= theme.layout.container.lg && values.lg !== undefined) return values.lg;
    if (screenWidth >= theme.layout.container.md && values.md !== undefined) return values.md;
    if (screenWidth >= theme.layout.container.sm && values.sm !== undefined) return values.sm;
    return fallback;
  },
};

// Export theme for direct access
export { theme };