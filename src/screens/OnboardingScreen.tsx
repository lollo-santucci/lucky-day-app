import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WelcomeScreen } from './WelcomeScreen';
import { BirthDetailsForm } from '../components/BirthDetailsForm';
import { BirthDetails } from '../types';
import { ProfileManager, ProfileCreationError } from '../services';
import { AstrologicalProfile } from '../types/astrology';
import { theme } from '@/styles';

interface OnboardingScreenProps {
  onComplete: (profile: AstrologicalProfile) => void;
}

type OnboardingPage = 'welcome' | 'birthDetails';

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState<OnboardingPage>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (birthDetails: BirthDetails) => {
    setIsSubmitting(true);
    try {
      // Validate the birth details before proceeding
      if (!birthDetails.date) {
        Alert.alert('Error', 'Please select your birth date');
        return;
      }

      if (!birthDetails.location.latitude || !birthDetails.location.longitude) {
        Alert.alert('Error', 'Please select your birth location');
        return;
      }

      // Create and save the astrological profile
      const profile = await ProfileManager.createAndSaveProfile(birthDetails);

      // Profile creation successful, pass it to the parent component
      onComplete(profile);

    } catch (error) {
      console.error('Profile creation failed:', error);

      let errorMessage = 'Failed to create your astrological profile. Please try again.';

      if (error instanceof ProfileCreationError) {
        switch (error.step) {
          case 'zodiac_calculation':
            errorMessage = 'Failed to calculate your Chinese zodiac. Please check your birth date.';
            break;
          case 'pillars_calculation':
            errorMessage = 'Failed to calculate your Four Pillars. Please check your birth details.';
            break;
          case 'storage_save':
            errorMessage = 'Failed to save your profile. Please check your device storage.';
            break;
          case 'profile_validation':
            errorMessage = 'Profile validation failed. Please try again.';
            break;
          default:
            errorMessage = `Profile creation failed: ${error.message}`;
        }
      }

      Alert.alert('Profile Creation Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show welcome page first
  if (currentPage === 'welcome') {
    return <WelcomeScreen onContinue={() => setCurrentPage('birthDetails')} />;
  }

  // Show birth details form
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Your Profile</Text>
            <Text style={styles.subtitle}>
              To personalize your daily fortunes, we need to know a bit about your cosmic blueprint
            </Text>
          </View>

          <BirthDetailsForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentPage('welcome')}
            disabled={isSubmitting}
          >
            <Text style={styles.backButtonText}>← Back to Welcome</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 18,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.light,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 24,
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.base,
  },
});