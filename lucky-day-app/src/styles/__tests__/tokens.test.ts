/**
 * Tests for design token utilities
 * Validates styling utilities and helper functions
 */

import { 
  spacing, 
  typography, 
  colorUtils, 
  layoutUtils, 
  componentStyles, 
  responsive,
  theme 
} from '../tokens';

describe('Design Token Utilities', () => {
  describe('Spacing Utilities', () => {
    it('gets spacing values correctly', () => {
      expect(spacing.get('base')).toBe(16);
      expect(spacing.get('lg')).toBe(20);
      expect(spacing.get(4)).toBe(16); // 4 * 4px unit
    });

    it('creates margin styles', () => {
      expect(spacing.margin.all('base')).toEqual({ margin: 16 });
      expect(spacing.margin.horizontal('sm')).toEqual({ marginHorizontal: 8 });
      expect(spacing.margin.vertical('lg')).toEqual({ marginVertical: 20 });
      expect(spacing.margin.top('xl')).toEqual({ marginTop: 24 });
    });

    it('creates padding styles', () => {
      expect(spacing.padding.all('base')).toEqual({ padding: 16 });
      expect(spacing.padding.horizontal('sm')).toEqual({ paddingHorizontal: 8 });
      expect(spacing.padding.vertical('lg')).toEqual({ paddingVertical: 20 });
      expect(spacing.padding.bottom('xl')).toEqual({ paddingBottom: 24 });
    });
  });

  describe('Typography Utilities', () => {
    it('creates text styles with options', () => {
      const style = typography.create({
        size: 'lg',
        weight: 'bold',
        color: 'primary',
      });

      expect(style.fontSize).toBe(18);
      expect(style.fontWeight).toBe('700');
      expect(style.color).toBe('#B83330');
    });

    it('has predefined text styles', () => {
      expect(typography.styles.h1.fontSize).toBe(32);
      expect(typography.styles.h1.fontWeight).toBe('700');
      
      expect(typography.styles.body.fontSize).toBe(14);
      expect(typography.styles.body.fontWeight).toBe('400');
      
      expect(typography.styles.caption.fontSize).toBe(10);
      expect(typography.styles.caption.color).toBe('#888888');
    });

    it('has decorative styles for Chinese elements', () => {
      expect(typography.styles.decorative.fontFamily).toBe('HanWangKaiMediumChuIn');
      expect(typography.styles.decorative.color).toBe('#B83330');
      
      expect(typography.styles.signature.fontFamily).toBe('ZCOOL XiaoWei');
      expect(typography.styles.signature.fontWeight).toBe('300');
    });

    it('calculates line heights correctly', () => {
      const style = typography.create({
        size: 'lg',
        lineHeight: 'normal',
      });

      expect(style.lineHeight).toBe(18 * 1.4); // fontSize * lineHeight ratio
    });
  });

  describe('Color Utilities', () => {
    it('gets color values by key', () => {
      expect(colorUtils.get('primary')).toBe('#B83330');
      expect(colorUtils.get('jadeRed')).toBe('#B83330');
      expect(colorUtils.get('softGold')).toBe('#F2C879');
    });

    it('creates colors with opacity', () => {
      const result = colorUtils.withOpacity('primary', 0.5);
      expect(result).toBe('rgba(184, 51, 48, 0.5)');
      
      const result2 = colorUtils.withOpacity('softGold', 0.3);
      expect(result2).toBe('rgba(242, 200, 121, 0.3)');
    });
  });

  describe('Layout Utilities', () => {
    it('creates container styles', () => {
      const container = layoutUtils.container();
      expect(container.paddingHorizontal).toBe(16);
      expect(container.paddingVertical).toBe(20);
      
      const containerNoVertical = layoutUtils.container({ vertical: false });
      expect(containerNoVertical.paddingVertical).toBe(0);
    });

    it('has flex utilities', () => {
      expect(layoutUtils.flex.center).toEqual({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      });
      
      expect(layoutUtils.flex.row).toEqual({
        flexDirection: 'row',
        alignItems: 'center',
      });
    });

    it('creates border radius styles', () => {
      expect(layoutUtils.borderRadius('base')).toEqual({ borderRadius: 8 });
      expect(layoutUtils.borderRadius('lg')).toEqual({ borderRadius: 16 });
    });

    it('creates shadow styles', () => {
      const shadow = layoutUtils.shadow('md');
      expect(shadow.shadowColor).toBe('#222222');
      expect(shadow.shadowOpacity).toBe(0.15);
      expect(shadow.elevation).toBe(4);
    });
  });

  describe('Component Style Generators', () => {
    it('generates button styles', () => {
      const primaryButton = componentStyles.button('primary');
      expect(primaryButton.backgroundColor).toBe('#B83330');
      expect(primaryButton.height).toBe(44);
      expect(primaryButton.borderRadius).toBe(8);
      
      const outlineButton = componentStyles.button('outline');
      expect(outlineButton.backgroundColor).toBe('transparent');
      expect(outlineButton.borderWidth).toBe(1);
      expect(outlineButton.borderColor).toBe('#E0E0E0');
    });

    it('generates input styles', () => {
      const input = componentStyles.input();
      expect(input.height).toBe(44);
      expect(input.borderRadius).toBe(8);
      expect(input.borderWidth).toBe(1);
      expect(input.backgroundColor).toBe('#FFFFFF');
      expect(input.borderColor).toBe('#E0E0E0');
    });

    it('generates card styles', () => {
      const card = componentStyles.card(true);
      expect(card.backgroundColor).toBe('#FFFFFF');
      expect(card.borderRadius).toBe(16);
      expect(card.shadowColor).toBe('#222222');
      
      const flatCard = componentStyles.card(false);
      expect(flatCard.shadowColor).toBeUndefined();
    });
  });

  describe('Responsive Utilities', () => {
    it('returns correct values based on screen width', () => {
      const values = { sm: 'small', md: 'medium', lg: 'large', xl: 'extra-large' };
      
      // sm: 320, md: 375, lg: 414, xl: 768
      expect(responsive.getValue(values, 300, 'default')).toBe('default'); // Below sm
      expect(responsive.getValue(values, 350, 'default')).toBe('small'); // Between sm and md
      expect(responsive.getValue(values, 400, 'default')).toBe('medium'); // Between md and lg
      expect(responsive.getValue(values, 450, 'default')).toBe('large'); // Between lg and xl
      expect(responsive.getValue(values, 800, 'default')).toBe('extra-large'); // Above xl
      expect(responsive.getValue({}, 400, 'default')).toBe('default');
    });
  });

  describe('Design Token Integration', () => {
    it('maintains consistency with theme values', () => {
      // Spacing utilities should match theme spacing
      expect(spacing.get('base')).toBe(theme.spacing.base);
      expect(spacing.get('lg')).toBe(theme.spacing.lg);
      
      // Color utilities should match theme colors
      expect(colorUtils.get('primary')).toBe(theme.colors.primary);
      expect(colorUtils.get('secondary')).toBe(theme.colors.secondary);
    });

    it('uses theme constants in component styles', () => {
      const button = componentStyles.button('primary');
      expect(button.backgroundColor).toBe(theme.colors.primary);
      expect(button.borderRadius).toBe(theme.borderRadius.base);
      expect(button.height).toBe(theme.layout.button.height.md);
    });
  });

  describe('Accessibility Compliance', () => {
    it('ensures minimum touch targets', () => {
      const button = componentStyles.button();
      expect(button.height).toBeGreaterThanOrEqual(44); // iOS minimum
      
      expect(theme.layout.hitTarget.min).toBe(44);
      expect(theme.layout.hitTarget.comfortable).toBe(48);
    });

    it('provides readable font sizes', () => {
      expect(typography.styles.body.fontSize).toBeGreaterThanOrEqual(14);
      expect(typography.styles.bodySmall.fontSize).toBeGreaterThanOrEqual(12);
      expect(typography.styles.caption.fontSize).toBeGreaterThanOrEqual(10);
    });

    it('maintains proper contrast ratios', () => {
      // Text colors should be different from background colors
      expect(theme.colors.textPrimary).not.toBe(theme.colors.background);
      expect(theme.colors.textPrimary).not.toBe(theme.colors.surface);
      
      // Primary button should have contrasting text
      expect(theme.colors.primary).not.toBe(theme.colors.textInverse);
    });
  });

  describe('Performance Considerations', () => {
    it('creates style objects efficiently', () => {
      // Style creation should be fast and not throw errors
      expect(() => spacing.margin.all('base')).not.toThrow();
      expect(() => typography.create({ size: 'lg' })).not.toThrow();
      expect(() => componentStyles.button('primary')).not.toThrow();
    });

    it('handles edge cases gracefully', () => {
      // Should handle invalid inputs without crashing
      expect(() => spacing.get(0 as any)).not.toThrow();
      expect(() => colorUtils.withOpacity('primary', 1.5)).not.toThrow();
    });
  });
});