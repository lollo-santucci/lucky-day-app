import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../styles';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing['2xl'],
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.light,
    color: theme.colors.accent,
    letterSpacing: 1,
    marginBottom: theme.spacing['2xl'],
  },
});
