/**
 * Fortune Cookie Component
 * Interactive fortune cookie with breaking animation
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
} from 'react-native';
import { theme } from '../styles/theme';
import { Fortune, CookieState } from '../types';
import { Text } from './Text';

interface FortuneCookieProps {
  state: CookieState;
  onBreak: () => void;
  fortune?: Fortune;
  disabled: boolean;
}

export const FortuneCookie: React.FC<FortuneCookieProps> = ({
  state,
  onBreak,
  fortune,
  disabled,
}) => {

  // Animation values
  const ticketAnimation = useRef(new Animated.Value(0)).current;
  const wiggleAnimation = useRef(new Animated.Value(0)).current;

  const handleCookiePress = () => {
    if (disabled || state !== 'closed') return;

    onBreak();
    playBreakingAnimation();
  };

  const playBreakingAnimation = () => {
    // Reset animation
    ticketAnimation.setValue(0);

    // Ticket emergence animation
    Animated.spring(ticketAnimation, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
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
      ticketAnimation.setValue(0);
    } else if (state === 'opened') {
      ticketAnimation.setValue(1);
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
      </Animated.View>
    </TouchableOpacity>
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
