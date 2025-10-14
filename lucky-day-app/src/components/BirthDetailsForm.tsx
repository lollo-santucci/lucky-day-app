import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BirthDetails } from '../types/astrology';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { LocationPicker } from './LocationPicker';
import { validateBirthDetails } from '../types/validation';
import { componentStyles, theme } from '../styles/index';

interface BirthDetailsFormProps {
  onSubmit: (birthDetails: BirthDetails) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
  initialValues?: BirthDetails;
}

export const BirthDetailsForm: React.FC<BirthDetailsFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  submitButtonText = 'Create My Profile',
  initialValues,
}) => {
  const [birthDetails, setBirthDetails] = useState<BirthDetails>(
    initialValues || {
      date: new Date(),
      time: null,
      location: {
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      },
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateBirthDate = (date: Date) => {
    setBirthDetails(prev => ({ ...prev, date }));
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  const updateBirthTime = (time: string | null) => {
    setBirthDetails(prev => ({ ...prev, time }));
  };

  const updateLocation = (location: BirthDetails['location']) => {
    setBirthDetails(prev => ({ ...prev, location }));
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const validateForm = (): boolean => {
    const validation = validateBirthDetails(birthDetails);
    
    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      
      if (!birthDetails.date) {
        newErrors.date = 'Birth date is required';
      }
      
      if (!birthDetails.location.latitude || !birthDetails.location.longitude) {
        newErrors.location = 'Birth location is required';
      }
      
      if (birthDetails.date && birthDetails.date > new Date()) {
        newErrors.date = 'Birth date cannot be in the future';
      }
      
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors and try again');
      return;
    }

    onSubmit(birthDetails);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Birth Date *</Text>
        <Text style={styles.sectionDescription}>
          When were you born? This determines your Chinese zodiac sign.
        </Text>
        <DatePicker
          value={birthDetails.date}
          onChange={updateBirthDate}
          error={errors.date}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Birth Time</Text>
        <Text style={styles.sectionDescription}>
          What time were you born? If unknown, we'll use noon for calculations.
        </Text>
        <TimePicker
          value={birthDetails.time}
          onChange={updateBirthTime}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Birth Location *</Text>
        <Text style={styles.sectionDescription}>
          Where were you born? This helps us calculate your Four Pillars accurately.
        </Text>
        <LocationPicker
          value={birthDetails.location}
          onChange={updateLocation}
          error={errors.location}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Processing...' : submitButtonText}
          </Text>
        </TouchableOpacity>
        
        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.disclaimer}>
        * Required fields. Your birth details are used only for astrological calculations and remain private on your device.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222222', // Ink Black
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#B83330', // Jade Red
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#B83330',
  },
  cancelButtonText: {
    color: '#B83330',
    fontSize: 16,
    fontWeight: '500',
  },
});