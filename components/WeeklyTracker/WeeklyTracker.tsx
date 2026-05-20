import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { DayCell, DayCellData } from './DayCell';
import { useWeeklyTrackerData } from '../../hooks/useWeeklyTrackerData';

export function WeeklyTracker() {
  const router = useRouter();
  const { days, refresh } = useWeeklyTrackerData();

  function handleDayPress(day: DayCellData) {
    if (!day.hasActivity) {
      router.push({ pathname: '/workout/create', params: { date: day.date } });
      return;
    }

    if (!day.workoutId) {
      Toast.show({
        type: 'error',
        text1: 'Workout not found',
        text2: 'This workout may have been deleted.',
      });
      refresh();
      return;
    }

    router.push({ pathname: '/workout/[id]', params: { id: day.workoutId } });
  }

  return (
    <View style={styles.container}>
      {days.map((day) => (
        <DayCell key={day.date} day={day} onPress={handleDayPress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
