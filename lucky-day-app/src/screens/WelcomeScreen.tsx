import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoHorizontal } from '../components';
import { theme } from '@/styles';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
            <LogoHorizontal
                height={250}
                width={320}
            />
        </View>

        {/* Welcome Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WELCOME TO LUCKY DAY</Text>
          <Text style={styles.bodyText}>
            Welcome to Lucky Day, your daily pocket-oracle inspired by ancient Chinese wisdom.
          </Text>
          <Text style={styles.bodyText}>
            Here, every morning begins with clarity, intention, and a touch of magic.
          </Text>
          <Text style={styles.bodyText}>
            Set your birth details once, unlock your personal cosmic fingerprint, and let your day unfold with guidance tailored uniquely to you.
          </Text>
          <Text style={styles.bodyText}>
            Whether you're chasing balance, opportunity, or just good vibes, Lucky Day helps you start every morning aligned with your best self.
          </Text>
        </View>

        {/* How it Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HOW DOES IT WORK?</Text>
          <Text style={styles.bodyText}>
            Lucky Day uses the Four Pillars system from Chinese astrology to build your personalized profile.
          </Text>
          <Text style={styles.bodyText}>
            Once you enter your date, time, and place of birth, the app calculates:
          </Text>
          
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Your main zodiac animal</Text>
            <Text style={styles.bulletItem}>• Your element and polarity</Text>
            <Text style={styles.bulletItem}>• Your strengths and weaknesses</Text>
            <Text style={styles.bulletItem}>
              • Your elemental balance (five elements, expressed as percentages)
            </Text>
            <Text style={styles.bulletItem}>
              • A brief identity archetype that captures your core vibe
            </Text>
          </View>

          <Text style={styles.bodyText}>
            This profile becomes the engine behind your daily guidance.
          </Text>
          <Text style={styles.bodyText}>
            Every morning at 8:00 AM, you receive your Fortune Cookie of the Day—a short message designed to help you navigate the next 24 hours with confidence.
          </Text>
          <Text style={styles.bodyText}>
            Open your cookie to reveal:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • A daily fortune sentence crafted specifically for you
            </Text>
            <Text style={styles.bulletItem}>
              • The actions you should take today
            </Text>
            <Text style={styles.bulletItem}>
              • The actions you should avoid to keep your energy aligned
            </Text>
          </View>

          <Text style={styles.bodyText}>
            Simple. Personal. Ritualistic.
          </Text>
          <Text style={styles.bodyText}>
            Your everyday cosmic check-in.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Create your profile →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    //marginBottom: 32,
    marginTop: -40,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  decorativeElement: {
    position: 'absolute',
    left: -20,
    top: 10,
    opacity: 0.6,
  },
  decorativeEmoji: {
    fontSize: 80,
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  chineseText: {
    fontSize: 18,
    color: theme.colors.accent,
    fontFamily: theme.typography.fontFamily.regular,
    marginBottom: 8,
  },
  logo: {
    width: 180,
    height: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.light,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.accent,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontFamily: theme.typography.fontFamily.light,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: theme.spacing.md,
  },
  bulletItem: {
    fontFamily: theme.typography.fontFamily.light,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  continueButton: {
    backgroundColor: theme.colors.textSecondary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.md,
  },
});
