/**
 * Lucky Day App
 * Main application component that handles navigation between screens
 * Integrates fortune generation with UI components
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingScreen, FortuneScreen, ProfileScreen } from './src/screens';
import { ProfileManager } from './src/services';
import { notificationService } from './src/services/notificationService';
import { AstrologicalProfile } from './src/types/astrology';
import { theme } from './src/styles';

type AppScreen = 'loading' | 'onboarding' | 'fortune' | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('loading');
  const [profile, setProfile] = useState<AstrologicalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app and check for existing profile
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Initialize the app and load existing profile
   */
  const initializeApp = async () => {
    try {
      setIsLoading(true);

      // Initialize notification service
      await notificationService.initialize();

      // Check for existing profile
      const existingProfile = await ProfileManager.loadProfile();
      
      if (existingProfile) {
        setProfile(existingProfile);
        setCurrentScreen('fortune');
        
        // Request notification permissions if not already granted
        try {
          const permissions = await notificationService.getPermissionStatus();
          if (!permissions.granted && permissions.canAskAgain) {
            // Request permissions in background, don't block app flow
            notificationService.requestPermissions().catch(error => {
              console.warn('Failed to request notification permissions:', error);
            });
          }
        } catch (error) {
          console.warn('Failed to check notification permissions:', error);
        }
      } else {
        setCurrentScreen('onboarding');
      }

    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart.',
        [{ text: 'OK', onPress: () => setCurrentScreen('onboarding') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle onboarding completion
   */
  const handleOnboardingComplete = async (newProfile: AstrologicalProfile) => {
    try {
      setProfile(newProfile);
      setCurrentScreen('fortune');

      // Request notification permissions after profile creation
      try {
        await notificationService.requestPermissions();
      } catch (error) {
        console.warn('Failed to request notification permissions after onboarding:', error);
      }

    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      Alert.alert(
        'Setup Error',
        'Failed to complete setup. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Handle profile updates
   */
  const handleProfileUpdate = (updatedProfile: AstrologicalProfile) => {
    setProfile(updatedProfile);
  };

  /**
   * Navigate to profile screen
   */
  const handleViewProfile = () => {
    setCurrentScreen('profile');
  };

  /**
   * Navigate back to fortune screen
   */
  const handleBackToFortune = () => {
    setCurrentScreen('fortune');
  };

  /**
   * Clear all app data (for debugging)
   */
  const handleClearAppData = async () => {
    try {
      const { AppStorage } = await import('./src/utils/storage');
      await AppStorage.clearAllData();
      console.log('All app data cleared - restarting app...');
      
      // Reset app state
      setProfile(null);
      setCurrentScreen('onboarding');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to clear app data:', error);
    }
  };

  /**
   * Render loading screen
   */
  const renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  /**
   * Render current screen based on app state
   */
  const renderCurrentScreen = () => {
    if (isLoading) {
      return renderLoadingScreen();
    }

    switch (currentScreen) {
      case 'onboarding':
        return (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        );

      case 'fortune':
        return profile ? (
          <FortuneScreen
            profile={profile}
            onViewProfile={handleViewProfile}
          />
        ) : (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        );

      case 'profile':
        return profile ? (
          <ProfileScreen
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onBack={handleBackToFortune}
          />
        ) : (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        );

      default:
        return renderLoadingScreen();
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {renderCurrentScreen()}
        <StatusBar style="dark" backgroundColor={theme.colors.background} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
