import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { createButtonStyle, createButtonTextStyle, theme } from '../styles/index';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  onPress,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.base,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing['3xl'],
        };
      default:
        return {
          paddingVertical: theme.spacing.base,
          paddingHorizontal: theme.spacing['2xl'],
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        createButtonStyle(variant, isDisabled),
        getSizeStyles(),
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? theme.colors.surface : theme.colors.primary} 
        />
      ) : (
        <Text style={createButtonTextStyle(variant, isDisabled)}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};