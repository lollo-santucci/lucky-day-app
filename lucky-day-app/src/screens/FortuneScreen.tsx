/**
 * Fortune Screen
 * Main screen that integrates fortune generation with the cookie UI
 * Implements requirements 1.4, 1.6, 2.1, 2.3 for fortune integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FortuneCookie } from '../components/FortuneCookie';
import { Text, ProfileSection, LogoHorizontal } from '../components';
import { fortuneManager, FortuneManagerError, FortuneManagerErrorType } from '../services/fortuneManager';
import { notificationService } from '../services/notificationService';
import { AstrologicalProfile } from '../types/astrology';
import { Fortune, CookieState } from '../types';
import { theme } from '../styles';

interface FortuneScreenProps {
  profile: AstrologicalProfile;
  onViewProfile: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FortuneScreen: React.FC<FortuneScreenProps> = ({
  profile,
  onViewProfile,
}) => {
  // State management
  const [cookieState, setCookieState] = useState<CookieState>('closed');
  const [currentFortune, setCurrentFortune] = useState<Fortune | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const [canGenerateNew, setCanGenerateNew] = useState(true);

  // Create styles with screen dimensions
  const styles = createStyles(screenHeight);

  // Initialize fortune manager and time and load existing fortune
  useEffect(() => {
    initializeFortuneManager();
  }, []);

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      updateFortuneState();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  /**
   * Initialize fortune manager and load existing state
   */
  const initializeFortuneManager = async () => {
    try {
      await fortuneManager.initialize();
      await notificationService.initialize();
      updateFortuneState();
    } catch (error) {
      console.error('Failed to initialize fortune manager:', error);
      setError('Failed to initialize app. Please restart.');
    }
  };

  /**
   * Update fortune state and UI
   */
  const updateFortuneState = useCallback(() => {
    const state = fortuneManager.getFortuneState();

    // If a new fortune can be generated and we currently have a fortune displayed,
    // clear it to show a fresh cookie (handles 8am daily reset)
    if (state.canGenerateNew && !state.currentFortune) {
      setCurrentFortune(null);
      setCookieState('closed');
    } else if (state.currentFortune) {
      // We have a fortune to display
      setCurrentFortune(state.currentFortune);
      setCookieState('opened');
    }

    setCanGenerateNew(state.canGenerateNew);

    // Always update countdown timer to show time until next 8am
    const hours = Math.floor(state.timeUntilNext / (1000 * 60 * 60));
    const minutes = Math.floor((state.timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((state.timeUntilNext % (1000 * 60)) / 1000);

    if (hours > 0) {
      setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`);
    } else if (minutes > 0) {
      setTimeUntilNext(`${minutes}m ${seconds}s`);
    } else {
      setTimeUntilNext(`${seconds}s`);
    }
  }, []);

  /**
   * Handle cookie break - generate new fortune
   */
  const handleCookieBreak = async () => {
    if (!canGenerateNew || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCookieState('breaking');

    try {
      // Generate new fortune
      const fortune = await fortuneManager.generateFortune(profile);

      // Update fortune state immediately
      setCurrentFortune(fortune);

      // Let the FortuneCookie component handle the animation timing
      // Don't immediately set to 'opened' - let the animation complete first
      setTimeout(() => {
        setCookieState('opened');
      }, 1500); // Wait for crack + break animations (300ms + 500ms + buffer)

      // Trigger notification for next day (requirement 1.6)
      await notificationService.triggerAfterFortuneReveal();

      // Update fortune state from manager
      updateFortuneState();

    } catch (error) {
      console.error('Fortune generation failed:', error);

      // Handle different error types
      if (error instanceof FortuneManagerError) {
        switch (error.type) {
          case FortuneManagerErrorType.COOLDOWN_ACTIVE:
            setError('Please wait 24 hours between fortunes');
            setCookieState('closed');
            break;

          case FortuneManagerErrorType.NO_PROFILE:
            setError('Profile not found. Please complete onboarding.');
            setCookieState('closed');
            break;

          case FortuneManagerErrorType.GENERATION_FAILED:
            // Show connectivity error fortune instead of error state
            const connectivityFortune = fortuneManager.getConnectivityErrorFortune(profile);
            setCurrentFortune(connectivityFortune);
            setCookieState('opened');
            break;

          default:
            setError('Failed to generate fortune. Please try again.');
            setCookieState('closed');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
        setCookieState('closed');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle retry for connectivity errors
   */
  const handleRetry = async () => {
    if (currentFortune?.source === 'connectivity_error') {
      await handleCookieBreak();
    }
  };

  /**
   * 🧪 TEST: Simulate 8am reset by clearing the fortune
   */
  const handleTestReset = async () => {
    try {
      await fortuneManager.clearFortune();
      setCurrentFortune(null);
      setCookieState('closed');
      setCanGenerateNew(true);
      updateFortuneState();
      console.log('🧪 TEST: Fortune cleared - simulating 8am reset');
    } catch (error) {
      console.error('Failed to clear fortune:', error);
    }
  };

  /**
   * Render loading state during fortune generation
   */
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Consulting the cosmic forces...</Text>
    </View>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          setError(null);
          updateFortuneState();
        }}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render cooldown state
   */
  const renderCooldownState = () => (
    <View style={styles.cooldownContainer}>
      <Text style={styles.cooldownText}>Next Cookie in {timeUntilNext}</Text>
    </View>
  );

  /**
   * Render connectivity error retry option
   */
  const renderConnectivityError = () => (
    <View style={styles.connectivityContainer}>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleRetry}
        disabled={isGenerating}
      >
        <Text style={styles.retryButtonText}>
          {isGenerating ? 'Retrying...' : 'Try Again'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: theme.spacing.xl }]}>
      {/* Header */}
      <View style={styles.header}>
        <LogoHorizontal
          height={600}
          width={230}
        />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Error State */}
        {error && renderErrorState()}

        {/* Loading State */}
        {isGenerating && renderLoadingState()}



        {/* Fortune Cookie */}
        {!error && !isGenerating && (
          <>
            <FortuneCookie
              state={cookieState}
              onBreak={handleCookieBreak}
              fortune={currentFortune || undefined}
              disabled={!canGenerateNew || isGenerating}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <Text style={styles.dividerText}>幸运饼干</Text>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}
      </View>

      {/* Profile Section */}
      <ProfileSection
        profile={profile}
        onPress={onViewProfile}
      />
      {/* Footer */}
      <View style={styles.footer}>
        {renderCooldownState()}

        {/* 🧪 TEST BUTTON - Remove before production */}
        {currentFortune && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestReset}
          >
            <Text style={styles.testButtonText}>🧪 Test 8am Reset</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (screenHeight: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: screenHeight / 4, // 1/5 of screen height
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    //paddingHorizontal: theme.spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.primary || '#B83330',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  cooldownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
  },
  cooldownTitle: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  cooldownText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  cooldownSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  connectivityContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  profileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dividerContainer: {
    marginTop: theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerText: {
    fontFamily: theme.typography.fontFamily.light,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    marginRight: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.textSecondary,
  },
  testButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFE5B4',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  testButtonText: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '600',
    textAlign: 'center',
  },
  inlineCountdownContainer: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  inlineCountdownText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

});