import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { theme } from '../styles';

export type PillarType = 'year' | 'month' | 'day' | 'hour';

interface PillarCardProps {
  type: PillarType;
  animal: string;
  element: string;
  polarity: string;
  description: string;
}

const PILLAR_LABELS: Record<PillarType, string> = {
  year: 'YEAR',
  month: 'MONTH',
  day: 'DAY',
  hour: 'HOUR',
};

const PILLAR_SUBTITLES: Record<PillarType, string> = {
  year: 'How the world sees you',
  month: 'Your environment',
  day: 'Who you really are',
  hour: 'Who you are becoming',
};

const ANIMAL_ICONS: Record<string, ImageSourcePropType> = {
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

const ELEMENT_ICONS: Record<string, ImageSourcePropType> = {
  water: require('../../assets/icons/water.png'),
  wood: require('../../assets/icons/wood.png'),
  fire: require('../../assets/icons/fire.png'),
  metal: require('../../assets/icons/metal.png'),
  earth: require('../../assets/icons/earth.png'),
};

const POLARITY_ICON = require('../../assets/icons/polarity.png');

export const PillarCard: React.FC<PillarCardProps> = ({
  type,
  animal,
  element,
  polarity,
  description,
}) => {
  const animalLower = animal.toLowerCase();
  const elementLower = element.toLowerCase();
  const polarityLower = polarity.toLowerCase();
  const animalIcon = ANIMAL_ICONS[animalLower];
  const elementIcon = ELEMENT_ICONS[elementLower];
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{PILLAR_LABELS[type]}</Text>
      
      <View style={styles.attributesRow}>
        <View style={styles.attribute}>
          <Text style={styles.attributeLabel}>ANIMAL</Text>
          <View style={styles.badge}>
            {animalIcon && <Image source={animalIcon} style={styles.iconImage} />}
            <Text style={styles.attributeValue}>{animal}</Text>
          </View>
        </View>
        
        <View style={styles.attribute}>
          <Text style={styles.attributeLabel}>ELEMENT</Text>
          <View style={styles.badge}>
            {elementIcon && <Image source={elementIcon} style={styles.iconImage} />}
            <Text style={styles.attributeValue}>
              {element}
            </Text>
          </View>
        </View>
        
        <View style={styles.attribute}>
          <Text style={styles.attributeLabel}>POLARITY</Text>
          <View style={styles.badge}>
            <Image source={POLARITY_ICON} style={styles.iconImage} />
            <Text style={styles.attributeValue}>
              {polarity}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.subtitle}>{PILLAR_SUBTITLES[type]}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    //backgroundColor: theme.colors.surface,
    //borderRadius: theme.borderRadius.lg,
    //padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    //borderWidth: 1,
    //borderColor: theme.colors.borderLight,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.light,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: theme.spacing.base,
  },
  attributesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  attribute: {
    flex: 1,
  },
  attributeLabel: {
    fontSize: theme.typography.fontSize.sm * 1.1,
    fontFamily: theme.typography.fontFamily.light,
    color: theme.colors.accent,
    marginBottom: theme.spacing.sm,
  },
  attributeValue: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.light,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconImage: {
    width: 25,
    height: 25,
    marginRight: theme.spacing.md * 0.3,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.light,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing.xs,
  },
});
