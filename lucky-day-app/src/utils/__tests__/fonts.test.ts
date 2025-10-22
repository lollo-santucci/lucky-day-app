/**
 * Font utilities tests
 */

import { getFontFamily, FontFamilies, loadFonts, waitForFonts } from '../fonts';

describe('Font Utilities', () => {
  describe('getFontFamily', () => {
    it('should return correct font family', () => {
      expect(getFontFamily('system')).toBe('System');
      expect(getFontFamily('default')).toBe('OpenSauceOne-Regular');
      expect(getFontFamily('primary')).toBe('OpenSauceOne-Regular');
      expect(getFontFamily('bold')).toBe('OpenSauceOne-Bold');
    });

    it('should fallback to system font for invalid family', () => {
      // @ts-expect-error - testing invalid input
      expect(getFontFamily('invalid')).toBe('System');
    });
  });

  describe('FontFamilies', () => {
    it('should have required font families', () => {
      expect(FontFamilies.system).toBe('System');
      expect(FontFamilies.default).toBe('OpenSauceOne-Regular');
      expect(FontFamilies.primary).toBe('OpenSauceOne-Regular');
      expect(FontFamilies.bold).toBe('OpenSauceOne-Bold');
    });
  });

  describe('loadFonts', () => {
    it('should load fonts without error', async () => {
      await expect(loadFonts()).resolves.not.toThrow();
    });
  });

  describe('waitForFonts', () => {
    it('should resolve when fonts are ready', async () => {
      await expect(waitForFonts()).resolves.not.toThrow();
    });
  });
});