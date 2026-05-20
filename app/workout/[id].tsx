import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { getWorkout } from '../../api/workouts';

interface Workout {
  id: string;
  name: string;
  date: string;
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getWorkout(id)
      .then((data) => {
        if (!cancelled) setWorkout(data);
      })
      .catch(() => {
        if (!cancelled) {
          Toast.show({
            type: 'error',
            text1: 'Workout not found',
            text2: 'This workout may have been deleted.',
          });
          router.back();
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!workout) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{workout.name}</Text>
      <Text style={styles.date}>{workout.date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
});
