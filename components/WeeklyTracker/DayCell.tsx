import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { CheckIcon } from '../icons/CheckIcon';

export interface DayCellData {
  date: string;
  label: string;
  hasActivity: boolean;
  workoutId?: string;
}

interface DayCellProps {
  day: DayCellData;
  onPress: (day: DayCellData) => void;
}

export function DayCell({ day, onPress }: DayCellProps) {
  const accessibilityLabel = day.hasActivity
    ? `${day.label}, workout logged`
    : `${day.label}, no workout logged`;

  return (
    <Pressable
      onPress={() => onPress(day)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{day.label}</Text>
      <View style={styles.indicator}>
        {day.hasActivity && <CheckIcon />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  pressed: {
    opacity: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
