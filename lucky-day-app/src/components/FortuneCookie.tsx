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
  Image,
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
  const wiggleAnimation = useRef(new Animated.Value(0)).current;
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

  // Wiggle animation loop - runs every 2 seconds when cookie is closed
  useEffect(() => {
    if (state === 'closed' && !disabled) {
      const wiggleLoop = () => {
        Animated.sequence([
          Animated.timing(wiggleAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnimation, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnimation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(1600), // Wait 1.6s to complete 2s cycle
        ]).start(() => {
          if (state === 'closed' && !disabled) {
            wiggleLoop();
          }
        });
      };
      
      // Start the wiggle loop after a short delay
      const timeout = setTimeout(wiggleLoop, 500);
      
      return () => {
        clearTimeout(timeout);
        wiggleAnimation.setValue(0);
      };
    } else {
      wiggleAnimation.setValue(0);
    }
  }, [state, disabled, wiggleAnimation]);

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
              {
                rotate: wiggleAnimation.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ['-8deg', '0deg', '8deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/fortune-cookie.png')}
          style={styles.cookieImage}
          resizeMode="contain"
        />

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
          fontSize="3xl"
          color="textPrimary"
          textAlign="left"
          style={styles.fortuneMessage}
          numberOfLines={0}
        >
          {fortune?.message || 'Your fortune awaits...'}
        </Text>

        {/* Luck and Unluck Actions */}
        {fortune?.actions && (
          <View style={styles.actionsContainer}>
            {/* Luck Section */}
            <View style={styles.actionColumn}>
              <Text
                fontFamily="light"
                fontSize="sm"
                color="accent"
                textAlign="left"
                style={styles.actionTitle}
              >
                阳 - LUCK
              </Text>
              <Text
                fontFamily="light"
                fontSize="base"
                color="textPrimary"
                textAlign="left"
                style={styles.actionList}
              >
                {fortune.actions.luck.join('\n')}
              </Text>
            </View>

            {/* Unluck Section */}
            <View style={styles.actionColumn}>
              <Text
                fontFamily="light"
                fontSize="sm"
                color="primary"
                textAlign="left"
                style={styles.actionTitle}
              >
                阴 - UNLUCK
              </Text>
              <Text
                fontFamily="light"
                fontSize="base"
                color="textPrimary"
                textAlign="left"
                style={styles.actionList}
              >
                {fortune.actions.unluck.join('\n')}
              </Text>
            </View>
          </View>
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: theme.colors.background,
  },
  cookieContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cookie: {
    width: 300,
    height: 200,
    position: 'relative',
  },
  cookieImage: {
    width: '100%',
    height: '100%',
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
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  fortuneHeader: {
    marginBottom: theme.spacing.md,
  },
  fortuneMessage: {
    lineHeight: theme.typography.fontSize['3xl'] * 1.2,
    letterSpacing: 0.1,
  },
  actionsContainer: {
    marginTop: theme.spacing['lg'],
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: theme.spacing.lg,
  },
  actionColumn: {
    // Removed flex: 1 to let columns take only the space they need
  },
  actionTitle: {
    marginBottom: theme.spacing.xs,
  },
  actionList: {
    lineHeight: theme.typography.fontSize.md * 1.4,
  },

});
