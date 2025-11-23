import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { BirthDetails } from '../types/astrology';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { LocationPicker } from './LocationPicker';
import { theme } from '@/styles';


interface BirthDetailsFormProps {
  onSubmit: (birthDetails: BirthDetails) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  submitButtonText?: string;
  initialValues?: BirthDetails;
}

export const BirthDetailsForm: React.FC<BirthDetailsFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  isSubmitting = false,
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

    if (Object.keys(newErrors).length > 0) {
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BIRTH DATE*</Text>
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
          <Text style={styles.sectionTitle}>BIRTH TIME</Text>
          <Text style={styles.sectionDescription}>
            What time were you born? If unknown, we'll use noon for calculations.
          </Text>
          <TimePicker
            key={`time-${birthDetails.time || 'null'}-${birthDetails.date.getTime()}`}
            value={birthDetails.time}
            onChange={updateBirthTime}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BIRTH LOCATION *</Text>
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
            style={[styles.submitButton, (isLoading || isSubmitting) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {(isLoading || isSubmitting) ? 'Processing...' : submitButtonText}
            </Text>
          </TouchableOpacity>

          {onCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isLoading || isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.disclaimer}>
          * Required fields. Your birth details are used only for astrological calculations and remain private on your device.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.light,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.accent,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontFamily: theme.typography.fontFamily.light,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: theme.colors.textSecondary, // Jade Red
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.md,
  },
  disclaimer: {
    fontFamily: theme.typography.fontFamily.light,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
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
    borderColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.md,
  },
});