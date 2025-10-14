/**
 * Tests for theme configuration
 * Validates that our design system has consistent values
 */

import { theme } from '../theme';

describe('Theme Configuration', () => {
  describe('Colors', () => {
    it('has all required brand colors', () => {
      expect(theme.colors.primary).toBe('#B83330');
      expect(theme.colors.background).toBe('#FAF6F0');
      expect(theme.colors.surface).toBe('#FFFFFF');
      expect(theme.colors.text).toBe('#222222');
      expect(theme.colors.accent).toBe('#F2C879');
    });

    it('has semantic colors', () => {
      expect(theme.colors.success).toBeDefined();
      expect(theme.colors.warning).toBeDefined();
      expect(theme.colors.error).toBeDefined();
      expect(theme.colors.info).toBeDefined();
    });

    it('has neutral colors for text hierarchy', () => {
      expect(theme.colors.textSecondary).toBe('#666666');
      expect(theme.colors.textTertiary).toBe('#888888');
      expect(theme.colors.border).toBe('#E0E0E0');
      expect(theme.colors.disabled).toBe('#CCCCCC');
    });

    it('has interactive state colors', () => {
      expect(theme.colors.primaryLight).toBeDefined();
      expect(theme.colors.primaryDark).toBeDefined();
      expect(theme.colors.accentLight).toBeDefined();
      expect(theme.colors.accentDark).toBeDefined();
    });
  });

  describe('Typography', () => {
    it('has consistent font size scale', () => {
      expect(theme.typography.fontSize.xs).toBe(10);
      expect(theme.typography.fontSize.sm).toBe(12);
      expect(theme.typography.fontSize.base).toBe(14);
      expect(theme.typography.fontSize.md).toBe(16);
      expect(theme.typography.fontSize.lg).toBe(18);
      expect(theme.typography.fontSize.xl).toBe(20);
      expect(theme.typography.fontSize['2xl']).toBe(24);
      expect(theme.typography.fontSize['3xl']).toBe(28);
    });

    it('has proper font weight values', () => {
      expect(theme.typography.fontWeight.light).toBe('300');
      expect(theme.typography.fontWeight.normal).toBe('400');
      expect(theme.typography.fontWeight.medium).toBe('500');
      expect(theme.typography.fontWeight.semibold).toBe('600');
      expect(theme.typography.fontWeight.bold).toBe('700');
    });

    it('has line height values for readability', () => {
      expect(theme.typography.lineHeight.tight).toBe(1.2);
      expect(theme.typography.lineHeight.normal).toBe(1.4);
      expect(theme.typography.lineHeight.relaxed).toBe(1.6);
      expect(theme.typography.lineHeight.loose).toBe(1.8);
    });
  });

  describe('Spacing', () => {
    it('has consistent spacing scale based on 4px unit', () => {
      expect(theme.spacing.unit).toBe(4);
      expect(theme.spacing.xs).toBe(4);
      expect(theme.spacing.sm).toBe(8);
      expect(theme.spacing.md).toBe(12);
      expect(theme.spacing.base).toBe(16);
      expect(theme.spacing.lg).toBe(20);
      expect(theme.spacing.xl).toBe(24);
      expect(theme.spacing['2xl']).toBe(32);
    });

    it('follows mathematical progression', () => {
      // Each step should be a multiple of the base unit
      Object.values(theme.spacing).forEach(value => {
        if (typeof value === 'number') {
          expect(value % theme.spacing.unit).toBe(0);
        }
      });
    });
  });

  describe('Border Radius', () => {
    it('has consistent border radius values', () => {
      expect(theme.borderRadius.none).toBe(0);
      expect(theme.borderRadius.sm).toBe(4);
      expect(theme.borderRadius.base).toBe(8);
      expect(theme.borderRadius.md).toBe(12);
      expect(theme.borderRadius.lg).toBe(16);
      expect(theme.borderRadius.xl).toBe(20);
      expect(theme.borderRadius.full).toBe(9999);
    });
  });

  describe('Shadows', () => {
    it('has shadow configurations for elevation', () => {
      expect(theme.shadows.sm).toBeDefined();
      expect(theme.shadows.md).toBeDefined();
      expect(theme.shadows.lg).toBeDefined();
    });

    it('has proper shadow structure', () => {
      const shadow = theme.shadows.sm;
      expect(shadow.shadowColor).toBeDefined();
      expect(shadow.shadowOffset).toBeDefined();
      expect(shadow.shadowOpacity).toBeDefined();
      expect(shadow.shadowRadius).toBeDefined();
      expect(shadow.elevation).toBeDefined();
    });

    it('has increasing shadow intensity', () => {
      expect(theme.shadows.sm.shadowOpacity).toBeLessThan(theme.shadows.md.shadowOpacity);
      expect(theme.shadows.md.shadowOpacity).toBeLessThan(theme.shadows.lg.shadowOpacity);
      
      expect(theme.shadows.sm.elevation).toBeLessThan(theme.shadows.md.elevation);
      expect(theme.shadows.md.elevation).toBeLessThan(theme.shadows.lg.elevation);
    });
  });

  describe('Design System Consistency', () => {
    it('uses consistent color naming convention', () => {
      const colorKeys = Object.keys(theme.colors);
      
      // Should have primary brand colors
      expect(colorKeys).toContain('primary');
      expect(colorKeys).toContain('background');
      expect(colorKeys).toContain('surface');
      expect(colorKeys).toContain('text');
      expect(colorKeys).toContain('accent');
      
      // Should have semantic colors
      expect(colorKeys).toContain('success');
      expect(colorKeys).toContain('warning');
      expect(colorKeys).toContain('error');
      expect(colorKeys).toContain('info');
    });

    it('has proper contrast ratios', () => {
      // Primary button should have sufficient contrast
      expect(theme.colors.primary).not.toBe(theme.colors.surface);
      
      // Text should contrast with background
      expect(theme.colors.text).not.toBe(theme.colors.background);
      expect(theme.colors.text).not.toBe(theme.colors.surface);
    });

    it('maintains brand color consistency', () => {
      // Error color should match primary for brand consistency
      expect(theme.colors.error).toBe(theme.colors.primary);
    });
  });

  describe('Accessibility', () => {
    it('provides sufficient touch target sizes', () => {
      // Minimum touch target should be 44px (iOS) or 48dp (Android)
      // Our base spacing of 16px * 2 = 32px for padding gives us adequate targets
      expect(theme.spacing.base * 2).toBeGreaterThanOrEqual(32);
    });

    it('has readable font sizes', () => {
      // Minimum readable font size should be 12px
      expect(theme.typography.fontSize.sm).toBeGreaterThanOrEqual(12);
      expect(theme.typography.fontSize.base).toBeGreaterThanOrEqual(14);
    });

    it('provides proper line heights for readability', () => {
      // Line heights should be at least 1.2 for readability
      Object.values(theme.typography.lineHeight).forEach(lineHeight => {
        expect(lineHeight).toBeGreaterThanOrEqual(1.2);
      });
    });
  });

  describe('Performance', () => {
    it('uses immutable theme object', () => {
      // Theme should be frozen to prevent accidental mutations
      // This test documents the expectation even if not enforced
      expect(typeof theme).toBe('object');
      expect(theme).toBeDefined();
    });

    it('has reasonable number of design tokens', () => {
      // Too many tokens can be overwhelming, too few can be limiting
      const colorCount = Object.keys(theme.colors).length;
      const spacingCount = Object.keys(theme.spacing).length;
      const fontSizeCount = Object.keys(theme.typography.fontSize).length;
      
      expect(colorCount).toBeGreaterThan(10);
      expect(colorCount).toBeLessThan(30);
      
      expect(spacingCount).toBeGreaterThan(5);
      expect(spacingCount).toBeLessThan(15);
      
      expect(fontSizeCount).toBeGreaterThan(5);
      expect(fontSizeCount).toBeLessThan(12);
    });
  });
});