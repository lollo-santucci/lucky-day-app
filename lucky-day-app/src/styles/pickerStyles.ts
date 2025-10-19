/**
 * Shared styles for picker components (DatePicker, TimePicker, LocationPicker)
 * Ensures consistent styling across all picker components
 */

import { StyleSheet } from 'react-native';

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
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  pickerButtonFocused: {
    borderColor: '#B83330',
    shadowColor: '#B83330',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  pickerButtonError: {
    borderColor: '#B83330',
  },
  
  pickerButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },

  // Text Styles
  pickerText: {
    fontSize: 16,
    color: '#222222', // Ink Black
  },
  
  pickerTextError: {
    color: '#B83330', // Jade Red
  },
  
  pickerTextDisabled: {
    color: '#888888',
  },

  // Chevron
  chevron: {
    fontSize: 20,
    color: '#CCCCCC',
    transform: [{ rotate: '90deg' }],
  },

  // Error Text
  errorText: {
    color: '#B83330', // Jade Red
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#222222',
  },
  
  cancelButton: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  
  confirmButton: {
    color: '#B83330',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#B83330', // Jade Red
    borderColor: '#B83330',
  },
  
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  unknownText: {
    fontSize: 14,
    color: '#666666',
  },

  // Time Picker Specific Styles
  timePreview: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B83330',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
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
    fontSize: 16,
    color: '#222222',
  },
  
  pickerItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});