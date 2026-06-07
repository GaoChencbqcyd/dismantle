import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

export function CompassScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>
        Compass Screen
      </Text>
      <Text style={[styles.subtext, { color: colors.textTertiary }]}>
        Sprint 0 — Placeholder
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 13,
    marginTop: 8,
  },
});
