import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ROUTES, RootStackParamList } from '../../navigation/routes';
import type { WeekDay, WeekTrackerProps } from './WeekTracker.types';

type WeekTrackerNavProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Sub-component: single day cell ─────────────────────────────────────────

interface DayCellProps {
  day: WeekDay;
  onPress: (day: WeekDay) => void;
}

/**
 * A single pressable day cell within the WeekTracker.
 *
 * Touch target is guaranteed to be at least 44×44pt by combining
 * minWidth/minHeight on the Pressable with hitSlop extending the
 * tappable area outside the visible bounds where needed.
 *
 * Visual rendering is identical to the pre-interactive design:
 * - Day label (e.g. "Mon") rendered in a Text element
 * - Check icon (✓) shown when hasWorkout is true
 * - Empty circle / placeholder shown when hasWorkout is false
 */
const DayCell = React.memo(({ day, onPress }: DayCellProps) => {
  const handlePress = useCallback(() => {
    onPress(day);
  }, [onPress, day]);

  const accessibilityLabel = day.hasWorkout
    ? `${day.label}, workout logged. Tap to view workout.`
    : `${day.label}, no workout logged. Tap to create a workout.`;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={({ pressed }) => [
        styles.dayCell,
        // Subtle press feedback that does not alter layout
        pressed && styles.dayCellPressed,
        // Web: show pointer cursor on hover
        Platform.OS === 'web' && (styles.webCursor as object),
      ]}
      testID={`day-cell-${day.date}`}
    >
      {/* Day label — visually unchanged */}
      <Text style={styles.dayLabel}>{day.label}</Text>

      {/* Workout indicator — visually unchanged */}
      {day.hasWorkout ? (
        <View style={styles.checkContainer} testID={`check-icon-${day.date}`}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      ) : (
        <View style={styles.emptyIndicator} testID={`empty-indicator-${day.date}`} />
      )}
    </Pressable>
  );
});

DayCell.displayName = 'DayCell';

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * WeekTracker
 *
 * Displays a 7-day progress tracker showing which days have logged workouts.
 * Each day cell is pressable:
 *  - Tap a day with no workout → Navigate to Create Workout (date pre-filled)
 *  - Tap a day with a workout  → Navigate to Workout Detail for that workout
 *
 * Visual design is identical to the non-interactive version.
 */
export const WeekTracker: React.FC<WeekTrackerProps> = ({ days, testID }) => {
  const navigation = useNavigation<WeekTrackerNavProp>();

  /**
   * Memoised handler shared across all day cells.
   * Each DayCell wraps this in its own useCallback bound to its day object,
   * so the identity of this function does not need to change per day.
   */
  const handleDayPress = useCallback(
    (day: WeekDay) => {
      if (day.workoutId) {
        // Day has a logged workout — navigate to the detail screen
        navigation.navigate(ROUTES.WORKOUT_DETAIL, { workoutId: day.workoutId });
      } else {
        // Day has no logged workout — navigate to create, pre-filling the date.
        // If the Create Workout screen does not consume the date param it will
        // be silently ignored and the screen will default to today.
        navigation.navigate(ROUTES.CREATE_WORKOUT, { date: day.date });
      }
    },
    [navigation],
  );

  return (
    <View style={styles.container} testID={testID ?? 'week-tracker'}>
      {days.map((day) => (
        <DayCell key={day.date} day={day} onPress={handleDayPress} />
      ))}
    </View>
  );
};

export default WeekTracker;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dayCell: {
    // Minimum 44×44pt touch target as per accessibility guidelines
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    // No background or border — visual appearance is determined by children
  },
  dayCellPressed: {
    opacity: 0.6,
  },
  /**
   * Web-only: show a pointer cursor on hover.
   * React Native Web maps the `cursor` style property to the CSS cursor property.
   * This is intentionally typed as `object` to avoid TS complaints about
   * cursor not being in RN's ViewStyle on non-web targets.
   */
  webCursor: {
    // @ts-ignore — cursor is a valid React Native Web style property
    cursor: 'pointer',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  emptyIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
  },
});
