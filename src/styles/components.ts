/**
 * Reusable component styles for Lucky Day App
 * Provides consistent styling for common UI patterns
 */

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { theme } from './theme';

export const componentStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  } as ViewStyle,
  
  section: {
    marginBottom: theme.spacing['2xl'],
  } as ViewStyle,
  
  // Card Styles
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base,
    ...theme.shadows.sm,
  } as ViewStyle,
  
  cardElevated: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  } as ViewStyle,
  
  // Input Styles
  inputContainer: {
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.base,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  } as ViewStyle,
  
  inputError: {
    borderColor: theme.colors.error,
  } as ViewStyle,
  
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  } as ViewStyle,
  
  // Button Styles
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  } as ViewStyle,
  
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  
  buttonDisabled: {
    backgroundColor: theme.colors.disabled,
  } as ViewStyle,
  
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  } as TextStyle,
  
  buttonTextSecondary: {
    color: theme.colors.primary,
  } as TextStyle,
  
  buttonTextDisabled: {
    color: theme.colors.textTertiary,
  } as TextStyle,
  
  // Typography Styles
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
  } as TextStyle,
  
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.relaxed,
  } as TextStyle,
  
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  
  sectionDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.base,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  } as TextStyle,
  
  bodyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.normal,
  } as TextStyle,
  
  captionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
  } as TextStyle,
  
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  } as TextStyle,
  
  // Layout Helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  // Form Styles
  formSection: {
    marginBottom: theme.spacing['2xl'],
  } as ViewStyle,
  
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.disabled,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  
  checkmark: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  } as TextStyle,
  
  // Picker Styles
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.base,
  } as ViewStyle,
  
  pickerButtonError: {
    borderColor: theme.colors.error,
  } as ViewStyle,
  
  pickerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  } as TextStyle,
  
  pickerTextDisabled: {
    color: theme.colors.textTertiary,
  } as TextStyle,
  
  chevron: {
    fontSize: 20,
    color: theme.colors.disabled,
    transform: [{ rotate: '90deg' }],
  } as TextStyle,
  
  // Modal and Overlay Styles
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    maxHeight: '80%',
  } as ViewStyle,
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  } as ViewStyle,
});

// Helper functions for dynamic styles
export const createInputStyle = (hasError: boolean, isFocused: boolean) => [
  componentStyles.input,
  hasError && componentStyles.inputError,
  isFocused && componentStyles.inputFocused,
];

export const createButtonStyle = (variant: 'primary' | 'secondary' = 'primary', disabled = false) => [
  componentStyles.button,
  variant === 'secondary' && componentStyles.buttonSecondary,
  disabled && componentStyles.buttonDisabled,
];

export const createButtonTextStyle = (variant: 'primary' | 'secondary' = 'primary', disabled = false) => [
  componentStyles.buttonText,
  variant === 'secondary' && componentStyles.buttonTextSecondary,
  disabled && componentStyles.buttonTextDisabled,
];