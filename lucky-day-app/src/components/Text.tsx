/**
 * Custom Text Component
 * Provides consistent typography with custom font support
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { getFontFamily, FontFamily } from '../utils/fonts';

interface TextProps extends RNTextProps {
  /** Font family to use */
  fontFamily?: FontFamily;
  /** Font size from theme */
  fontSize?: keyof typeof theme.typography.fontSize;
  /** Font weight from theme */
  fontWeight?: keyof typeof theme.typography.fontWeight;
  /** Text color from theme */
  color?: keyof typeof theme.colors;
  /** Line height from theme */
  lineHeight?: keyof typeof theme.typography.lineHeight;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  /** Whether text should be uppercase */
  uppercase?: boolean;
  /** Whether text should be lowercase */
  lowercase?: boolean;
  /** Whether text should be capitalized */
  capitalize?: boolean;
}

export const Text: React.FC<TextProps> = ({
  children,
  style,
  fontFamily = 'default',
  fontSize = 'base',
  fontWeight = 'normal',
  color = 'text',
  lineHeight = 'normal',
  textAlign = 'left',
  uppercase = false,
  lowercase = false,
  capitalize = false,
  ...props
}) => {
  const textStyle = [
    styles.text,
    {
      fontFamily: getFontFamily(fontFamily),
      fontSize: theme.typography.fontSize[fontSize],
      fontWeight: theme.typography.fontWeight[fontWeight],
      color: theme.colors[color],
      lineHeight: theme.typography.fontSize[fontSize] * theme.typography.lineHeight[lineHeight],
      textAlign,
      textTransform: uppercase ? 'uppercase' : lowercase ? 'lowercase' : capitalize ? 'capitalize' : 'none',
    },
    style,
  ];

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    // Base text styles
  },
});

// Convenience components for common text styles
export const Heading1: React.FC<Omit<TextProps, 'fontSize' | 'fontWeight'>> = (props) => (
  <Text fontSize="4xl" fontWeight="bold" {...props} />
);

export const Heading2: React.FC<Omit<TextProps, 'fontSize' | 'fontWeight'>> = (props) => (
  <Text fontSize="3xl" fontWeight="bold" {...props} />
);

export const Heading3: React.FC<Omit<TextProps, 'fontSize' | 'fontWeight'>> = (props) => (
  <Text fontSize="2xl" fontWeight="semibold" {...props} />
);

export const Heading4: React.FC<Omit<TextProps, 'fontSize' | 'fontWeight'>> = (props) => (
  <Text fontSize="xl" fontWeight="semibold" {...props} />
);

export const BodyText: React.FC<Omit<TextProps, 'fontSize'>> = (props) => (
  <Text fontSize="base" {...props} />
);

export const SmallText: React.FC<Omit<TextProps, 'fontSize'>> = (props) => (
  <Text fontSize="sm" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'fontSize' | 'color'>> = (props) => (
  <Text fontSize="xs" color="textSecondary" {...props} />
);