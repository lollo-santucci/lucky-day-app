/**
 * Shared styles for picker components (DatePicker, TimePicker, LocationPicker)
 * Ensures consistent styling across all picker components
 */

import { StyleSheet } from 'react-native';
import { theme } from '@/styles';

export const pickerStyles = StyleSheet.create({
  // Container
  container: {
    width: '100%',
  },

  // Button Styles
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.2,
    borderColor: theme.colors.textSecondary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  pickerButtonFocused: {
    borderColor: theme.colors.textSecondary,
    shadowColor: theme.colors.textSecondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  pickerButtonError: {
    borderColor: theme.colors.error,
  },
  
  pickerButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },

  // Text Styles
  pickerText: {
    fontFamily: theme.typography.fontFamily.light,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  
  pickerTextError: {
    color: theme.colors.error, 
  },
  
  pickerTextDisabled: {
    color: theme.colors.disabled,
  },

  // Chevron
  chevron: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    transform: [{ rotate: '90deg' }],
  },

  // Error Text
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginTop: 4,
    marginLeft: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(139, 75, 98, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  pickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  
  pickerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textPrimary,
  },
  
  cancelButton: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.disabled,
  },
  
  confirmButton: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.accent,
  },
  
  pickerContent: {
    padding: 20,
    minHeight: 200,
  },

  // Checkbox Styles (for TimePicker)
  unknownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkboxChecked: {
    backgroundColor: theme.colors.textSecondary, 
    borderColor: theme.colors.textSecondary,
  },
  
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  unknownText: {
    fontFamily: theme.typography.fontFamily.light,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
  },

  // Time Picker Specific Styles
  timePreview: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  
  pickerLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.disabled,
    marginBottom: 8,
  },
  
  pickerScroll: {
    height: 150,
    width: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  pickerItemSelected: {
    backgroundColor: '#B83330',
  },
  
  pickerItemText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  
  pickerItemTextSelected: {
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.disabled,
  },
});