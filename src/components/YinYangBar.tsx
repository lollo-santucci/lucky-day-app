import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles';

interface YinYangBarProps {
  yinPercentage: number;
  yangPercentage: number;
}

export const YinYangBar: React.FC<YinYangBarProps> = ({ yinPercentage, yangPercentage }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.yinLabel}>Yin {yinPercentage}%</Text>
      
      <View style={styles.barContainer}>
        <View style={[styles.yinBar, { flex: yinPercentage }]} />
        <View style={[styles.yangBar, { flex: yangPercentage }]} />
      </View>
      
      <Text style={styles.yangLabel}>{yangPercentage}% Yang</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  yinLabel: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    minWidth: 70,
  },
  yangLabel: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.secondary,
    minWidth: 70,
    textAlign: 'right',
  },
  barContainer: {
    flex: 1,
    height: 20,
    flexDirection: 'row',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  yinBar: {
    backgroundColor: theme.colors.textSecondary,
    height: '100%',
  },
  yangBar: {
    backgroundColor: theme.colors.secondary,
    height: '100%',
  },
});
