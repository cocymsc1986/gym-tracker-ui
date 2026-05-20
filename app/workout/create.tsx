import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, parseISO, isValid } from 'date-fns';
import { createWorkout } from '../../api/workouts';

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();

  const initialDate = resolveInitialDate(dateParam);
  const [date, setDate] = useState(initialDate);
  const [name, setName] = useState('');

  async function handleSubmit() {
    await createWorkout({ name, date });
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Workout Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Morning Run"
      />
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
      />
      <Button title="Save Workout" onPress={handleSubmit} />
    </View>
  );
}

function resolveInitialDate(dateParam: string | undefined): string {
  if (dateParam) {
    const parsed = parseISO(dateParam);
    if (isValid(parsed)) {
      return format(parsed, 'yyyy-MM-dd');
    }
  }
  return format(new Date(), 'yyyy-MM-dd');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
});
