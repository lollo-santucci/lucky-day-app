/**
 * Centralized styles export for Lucky Day App
 * Design Token System and Styling Utilities
 */

// Core theme and design tokens
export { theme, colors, typography, spacing, layout, borderRadius, shadows, animation } from './theme';

// Styling utilities and helpers
export { 
  spacing as spacingUtils,
  typography as typographyUtils,
  colorUtils,
  layoutUtils,
  componentStyles,
  responsive
} from './tokens';

// Legacy component styles (for backward compatibility)
export { componentStyles as legacyComponentStyles, createInputStyle, createButtonStyle, createButtonTextStyle } from './components';

// Import for type definitions
import { typography } from './theme';

// Re-export types from theme
export type { Theme, ThemeColors, ThemeFontSizes, ThemeSpacing } from './theme';

// Additional type definitions
export type ThemeFontWeights = keyof typeof typography.fontWeight;
export type ThemeFontFamilies = keyof typeof typography.fontFamily;