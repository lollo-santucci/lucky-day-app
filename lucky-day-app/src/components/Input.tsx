import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
} from 'react-native';
import { createInputStyle, componentStyles, theme } from '../styles/index';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required = false,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={componentStyles.inputContainer}>
      {label && (
        <Text style={[componentStyles.sectionTitle, { marginBottom: theme.spacing.xs }]}>
          {label}
          {required && <Text style={{ color: theme.colors.error }}> *</Text>}
        </Text>
      )}

      <TextInput
        style={[
          createInputStyle(!!error, isFocused),
          style,
        ]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={theme.colors.textTertiary}
        {...props}
      />

      {error && (
        <Text style={componentStyles.errorText}>{error}</Text>
      )}

      {helperText && !error && (
        <Text style={[componentStyles.captionText, { marginTop: theme.spacing.xs }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};