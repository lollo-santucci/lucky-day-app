import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { theme } from '../styles';

export type ElementType = 'water' | 'wood' | 'fire' | 'metal' | 'earth';

interface ElementBarProps {
  element: ElementType;
  percentage: number;
}

const ELEMENT_CONFIG: Record<ElementType, { color: string; icon: ImageSourcePropType }> = {
  water: { color: theme.colors.textSecondary, icon: require('../../assets/icons/water.png') },
  wood: { color: theme.colors.textSecondary, icon: require('../../assets/icons/wood.png') },
  fire: { color: theme.colors.textSecondary, icon: require('../../assets/icons/fire.png') },
  metal: { color: theme.colors.textSecondary, icon: require('../../assets/icons/metal.png') },
  earth: { color: theme.colors.textSecondary, icon: require('../../assets/icons/earth.png') },
};

export const ElementBar: React.FC<ElementBarProps> = ({ element, percentage }) => {
  const config = ELEMENT_CONFIG[element];
  
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.labelSection}>
          <Image source={config.icon} style={styles.iconImage} />
          <Text style={[styles.percentage, {color: config.color}]}>{percentage}%</Text>
        </View>
        
        <View style={styles.barBackground}>
          <View 
            style={[
              styles.barFill, 
              { width: `${percentage}%`, backgroundColor: config.color }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  labelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minWidth: 60,
  },
  iconImage: {
    width: 35,
    height: 35,
    marginEnd: theme.spacing.xs
  },
  percentage: {
    fontSize: theme.typography.fontSize.sm * 1.1,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
  },
  barBackground: {
    flex: 1,
    height: 35,
    //backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.full,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderTopRightRadius: theme.borderRadius.full,
    borderBottomRightRadius: theme.borderRadius.full,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
});
