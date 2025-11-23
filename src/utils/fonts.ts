/**
 * Font loading utilities for Lucky Day App
 * Handles custom font loading and provides font family mappings
 */

import * as Font from 'expo-font';

/**
 * Font family mappings
 * Maps logical font names to actual font file names
 */
export const FontFamilies = {
  // System fonts
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

  // Default font (using OpenSauceOne Regular)
  default: 'OpenSauceOne-Regular',
} as const;

/**
 * Font loading configuration
 * Maps font family names to their respective font files
 */
export const fontAssets = {
  // OpenSauceOne font files
  'OpenSauceOne-Light': require('../../assets/fonts/OpenSauceOne-Light.ttf'),
  'OpenSauceOne-Regular': require('../../assets/fonts/OpenSauceOne-Regular.ttf'),
  'OpenSauceOne-SemiBold': require('../../assets/fonts/OpenSauceOne-SemiBold.ttf'),
  'OpenSauceOne-Bold': require('../../assets/fonts/OpenSauceOne-Bold.ttf'),
};

/**
 * Load custom fonts
 * Call this function during app initialization
 */
export async function loadFonts(): Promise<void> {
  try {
    // Only load fonts if there are any custom fonts defined
    if (Object.keys(fontAssets).length > 0) {
      await Font.loadAsync(fontAssets);
      console.log('Custom fonts loaded successfully');
    } else {
      console.log('No custom fonts to load, using system fonts');
    }
  } catch (error) {
    console.warn('Failed to load custom fonts:', error);
    // App will continue with system fonts
  }
}

/**
 * Get font family name with fallback
 * @param fontFamily - The desired font family
 * @returns The font family name or system fallback
 */
export function getFontFamily(fontFamily: keyof typeof FontFamilies): string {
  return FontFamilies[fontFamily] || FontFamilies.system;
}

/**
 * Check if fonts are loaded
 * @returns Promise that resolves when fonts are ready
 */
export function waitForFonts(): Promise<void> {
  return new Promise((resolve) => {
    // If no custom fonts, resolve immediately
    if (Object.keys(fontAssets).length === 0) {
      resolve();
      return;
    }

    // Check if fonts are loaded
    const checkFonts = () => {
      try {
        // Try to access a custom font to see if it's loaded
        const fontNames = Object.keys(fontAssets);
        if (fontNames.length === 0 || Font.isLoaded(fontNames[0])) {
          resolve();
        } else {
          setTimeout(checkFonts, 100);
        }
      } catch {
        // If there's an error, just resolve to continue with system fonts
        resolve();
      }
    };

    checkFonts();
  });
}

export type FontFamily = keyof typeof FontFamilies;