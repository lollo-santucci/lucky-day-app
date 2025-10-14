import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BirthDetailsForm } from '../components/BirthDetailsForm';
import { BirthDetails } from '../types';
import { ProfileManager, ProfileCreationError } from '../services';
import { AstrologicalProfile } from '../types/astrology';

interface OnboardingScreenProps {
  onComplete: (profile: AstrologicalProfile) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
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
            <Text style={styles.title}>Welcome to Lucky Day</Text>
            <Text style={styles.subtitle}>
              To personalize your daily fortunes, we need to know a bit about your cosmic blueprint
            </Text>
          </View>

          <BirthDetailsForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F0', // Paper Ivory
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
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222', // Ink Black
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});