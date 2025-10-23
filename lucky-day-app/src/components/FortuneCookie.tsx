/**
 * Fortune Cookie Component
 * Interactive fortune cookie with breaking animation and sound effects
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Audio } from 'expo-av';
import { theme } from '../styles/theme';
import { Fortune, CookieState } from '../types';
import { Text } from './Text';

interface FortuneCookieProps {
  state: CookieState;
  onBreak: () => void;
  fortune?: Fortune;
  disabled: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FortuneCookie: React.FC<FortuneCookieProps> = ({
  state,
  onBreak,
  fortune,
  disabled,
}) => {

  // Animation values
  const crackAnimation = useRef(new Animated.Value(0)).current;
  const breakAnimation = useRef(new Animated.Value(0)).current;
  const ticketAnimation = useRef(new Animated.Value(0)).current;
  const particleAnimations = useRef(
    Array.from({ length: 8 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotation: new Animated.Value(0),
    }))
  ).current;

  // Sound state
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Load sound effect
  useEffect(() => {
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadSound = async () => {
    try {
      // For now, we'll skip loading the sound file since it's not available
      // In production, you would load a custom paper-tearing sound like this:
      // const { sound: audioSound } = await Audio.Sound.createAsync(
      //   require('../../assets/sounds/paper-tear.mp3'),
      //   { shouldPlay: false }
      // );
      // setSound(audioSound);
      console.log('Sound loading skipped - placeholder implementation');
    } catch (error) {
      console.log('Could not load sound:', error);
    }
  };
  const playBreakingSound = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.log('Could not play sound:', error);
    }
  };

  const handleCookiePress = () => {
    if (disabled || state !== 'closed') return;

    onBreak();
    playBreakingAnimation();
  };

  const playBreakingAnimation = () => {
    // Reset all animations
    crackAnimation.setValue(0);
    breakAnimation.setValue(0);
    ticketAnimation.setValue(0);
    particleAnimations.forEach(particle => {
      particle.x.setValue(0);
      particle.y.setValue(0);
      particle.opacity.setValue(0);
      particle.rotation.setValue(0);
    });

    // Play sound effect
    playBreakingSound();

    // Stage 1: Crack animation (300ms)
    Animated.timing(crackAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Stage 2: Break animation with particles (500ms)
      const breakAnimations = [
        Animated.timing(breakAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        ...particleAnimations.map((particle, index) => {
          const angle = (index / particleAnimations.length) * Math.PI * 2;
          const distance = 50 + Math.random() * 30;

          return Animated.parallel([
            Animated.timing(particle.x, {
              toValue: Math.cos(angle) * distance,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: Math.sin(angle) * distance - 20,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(particle.opacity, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(particle.rotation, {
              toValue: Math.random() * 360,
              duration: 800,
              useNativeDriver: true,
            }),
          ]);
        }),
      ];

      Animated.parallel(breakAnimations).start(() => {
        // Stage 3: Ticket emergence (400ms)
        Animated.spring(ticketAnimation, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      });
    });
  };

  // Handle state changes
  useEffect(() => {
    if (state === 'closed') {
      // Reset all animations
      crackAnimation.setValue(0);
      breakAnimation.setValue(0);
      ticketAnimation.setValue(0);
      particleAnimations.forEach(particle => {
        particle.x.setValue(0);
        particle.y.setValue(0);
        particle.opacity.setValue(0);
        particle.rotation.setValue(0);
      });
    } else if (state === 'opened') {
      // Ensure ticket animation is complete when state is set to opened
      // Set all animations to their final state
      crackAnimation.setValue(1);
      breakAnimation.setValue(1);
      ticketAnimation.setValue(1);
      // Hide particles
      particleAnimations.forEach(particle => {
        particle.opacity.setValue(0);
      });
    }
  }, [state]);

  const renderClosedCookie = () => (
    <TouchableOpacity
      testID="cookie-touchable"
      style={[styles.cookieContainer, disabled && styles.disabled]}
      onPress={handleCookiePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.cookie,
          {
            transform: [
              {
                scale: crackAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.05, 1.02],
                }),
              },
            ],
          },
        ]}
      >
        <View testID="cookie-top" style={styles.cookieTop} />
        <View testID="cookie-bottom" style={styles.cookieBottom} />

        {/* Crack lines */}
        <Animated.View
          style={[
            styles.crackLine,
            styles.crackLine1,
            {
              opacity: crackAnimation,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.crackLine,
            styles.crackLine2,
            {
              opacity: crackAnimation,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );

  const renderBreakingCookie = () => (
    <View testID="cookie-container" style={styles.cookieContainer}>
      {/* Cookie halves */}
      <Animated.View
        testID="cookie-half-left"
        style={[
          styles.cookieHalf,
          styles.cookieHalfLeft,
          {
            transform: [
              {
                translateX: breakAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
              {
                rotate: breakAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-15deg'],
                }),
              },
            ],
            opacity: breakAnimation.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 0.5, 0],
            }),
          },
        ]}
      />
      <Animated.View
        testID="cookie-half-right"
        style={[
          styles.cookieHalf,
          styles.cookieHalfRight,
          {
            transform: [
              {
                translateX: breakAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30],
                }),
              },
              {
                rotate: breakAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '15deg'],
                }),
              },
            ],
            opacity: breakAnimation.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 0.5, 0],
            }),
          },
        ]}
      />

      {/* Particles */}
      {particleAnimations.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderOpenedCookie = () => (
    <View testID="cookie-container" style={styles.cookieContainer}>
      {/* Fortune content */}
      <Animated.View
        testID="fortune-content"
        style={[
          styles.fortuneContent,
          {
            transform: [
              {
                translateY: ticketAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
              {
                scale: ticketAnimation.interpolate({
                  inputRange: [0, 0.8, 1],
                  outputRange: [0.8, 1.1, 1],
                }),
              },
            ],
            opacity: ticketAnimation,
          },
        ]}
      >
        {/* Header */}
        <Text
          testID="fortune-header"
          fontFamily="light"
          fontSize="md"
          color="accent"
          textAlign="left"
          style={styles.fortuneHeader}
        >
          YOUR DAILY FORTUNE
        </Text>

        {/* Fortune Message */}
        <Text
          testID="fortune-message"
          fontFamily="bold"
          fontSize="4xl"
          color="textPrimary"
          textAlign="left"
          style={styles.fortuneMessage}
          numberOfLines={0}
        >
          {fortune?.message || 'Your fortune awaits...'}
        </Text>
      </Animated.View>
    </View>
  );

  return (
    <View testID="cookie-container" style={styles.container}>
      {state === 'closed' && renderClosedCookie()}
      {state === 'breaking' && renderBreakingCookie()}
      {state === 'opened' && renderOpenedCookie()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    //backgroundColor: theme.colors.background,
  },
  cookieContainer: {
    width: '100%',
    maxWidth: 400,
    height: 300,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    position: 'relative',
  },
  cookie: {
    width: 120,
    height: 80,
    position: 'relative',
  },
  cookieTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: theme.colors.accent,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderWidth: 2,
    borderColor: '#E6B85C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cookieBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#E6B85C',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    borderWidth: 2,
    borderColor: '#D4A54A',
  },
  crackLine: {
    position: 'absolute',
    backgroundColor: theme.colors.text,
    opacity: 0,
  },
  crackLine1: {
    width: 2,
    height: 30,
    top: 25,
    left: 35,
    transform: [{ rotate: '15deg' }],
  },
  crackLine2: {
    width: 2,
    height: 25,
    top: 30,
    right: 30,
    transform: [{ rotate: '-20deg' }],
  },
  cookieHalf: {
    position: 'absolute',
    width: 60,
    height: 80,
    backgroundColor: theme.colors.accent,
    borderWidth: 2,
    borderColor: '#E6B85C',
  },
  cookieHalfLeft: {
    left: 0,
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
  },
  cookieHalfRight: {
    right: 0,
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  fortuneContent: {
    width: screenWidth,
    maxWidth: 400,
    //paddingHorizontal: theme.spacing.xl,
    //paddingVertical: theme.spacing['lg'],
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  fortuneHeader: {
    marginBottom: theme.spacing.md,
  },
  fortuneMessage: {
    lineHeight: theme.typography.fontSize['4xl'] * 1.2,
    letterSpacing: 0.1,
  },

});