/**
 * Profile Section Component
 * Displays user nickname and animal icon with navigation to profile
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Text } from './Text';
import { theme } from '../styles';
import { AstrologicalProfile } from '../types/astrology';

interface ProfileSectionProps {
  profile: AstrologicalProfile;
  onPress: () => void;
  variant?: 'default' | 'profile'; // 'default' shows "Go to profile", 'profile' shows back button
}

// Animal icon mapping
const getAnimalIcon = (animal: string): ImageSourcePropType => {
  const iconMap: Record<string, ImageSourcePropType> = {
    rat: require('../../assets/icons/rat.png'),
    ox: require('../../assets/icons/ox.png'),
    tiger: require('../../assets/icons/tiger.png'),
    rabbit: require('../../assets/icons/rabbit.png'),
    dragon: require('../../assets/icons/dragon.png'),
    snake: require('../../assets/icons/snake.png'),
    horse: require('../../assets/icons/horse.png'),
    goat: require('../../assets/icons/goat.png'),
    monkey: require('../../assets/icons/monkey.png'),
    rooster: require('../../assets/icons/rooster.png'),
    dog: require('../../assets/icons/dog.png'),
    pig: require('../../assets/icons/pig.png'),
  };

  return iconMap[animal] || iconMap.snake; // Fallback to snake if animal not found
};

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  profile,
  onPress,
  variant = 'default',
}) => {
  const animalIcon = getAnimalIcon(profile.zodiac.animal);

  if (variant === 'profile') {
    // Profile screen variant: back button on first row, no second row
    return (
      <View style={styles.container}>
        {/* First Row: Back Button */}
        <View style={styles.firstRow}>
          <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Text
              fontFamily="light"
              fontSize="md"
              color="accent"
              style={styles.backButton}
            >
              ← Fortune Cookie
            </Text>
          </TouchableOpacity>
        </View>

        {/* Second Row: Nickname and Icon */}
        <View style={styles.firstRow}>
          <Text
            fontFamily="bold"
            fontSize="2.5xl"
            color="secondary"
            style={styles.nickname}
          >
            {profile.mysticalNickname}
          </Text>
          <Image source={animalIcon} style={styles.animalIcon} resizeMode="contain" />
        </View>
      </View>
    );
  }

  // Default variant: nickname and icon on first row, "Go to profile" on second row
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* First Row: Nickname and Icon */}
      <View style={styles.firstRow}>
        <Text
          fontFamily="bold"
          fontSize="2.5xl"
          color="secondary"
          style={styles.nickname}
        >
          {profile.mysticalNickname}
        </Text>
        <Image source={animalIcon} style={styles.animalIcon} resizeMode="contain" />
      </View>

      {/* Second Row: Go to Profile Button */}
      <View style={styles.secondRow}>
        <Text
          fontFamily="light"
          fontSize="md"
          color="accent"
          style={styles.profileButton}
        >
          Go to profile →
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
    //paddingHorizontal: theme.spacing.xl,
  },
  firstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  nickname: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  animalIcon: {
    height: 80,
    width: 80,
  },
  secondRow: {
    alignItems: 'flex-end',
  },
  profileButton: {
    // No additional styles needed, using Text component props
  },
  backButton: {
    // No additional styles needed, using Text component props
  },
});