import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateWorkoutScreen from '../create';

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('../../../api/workouts', () => ({
  createWorkout: jest.fn().mockResolvedValue({ id: 'new-workout' }),
}));

const { useLocalSearchParams } = require('expo-router') as { useLocalSearchParams: jest.Mock };
const { createWorkout } = require('../../../api/workouts') as { createWorkout: jest.Mock };

beforeEach(() => jest.clearAllMocks());

describe('CreateWorkoutScreen', () => {
  it('pre-populates the date field when a date param is provided', () => {
    useLocalSearchParams.mockReturnValue({ date: '2024-01-15' });
    const { getByDisplayValue } = render(<CreateWorkoutScreen />);
    expect(getByDisplayValue('2024-01-15')).toBeTruthy();
  });

  it('defaults to today when no date param is provided', () => {
    useLocalSearchParams.mockReturnValue({});
    const { format, startOfDay } = require('date-fns');
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const { getByDisplayValue } = render(<CreateWorkoutScreen />);
    expect(getByDisplayValue(today)).toBeTruthy();
  });

  it('defaults to today for an invalid date param', () => {
    useLocalSearchParams.mockReturnValue({ date: 'not-a-date' });
    const { format, startOfDay } = require('date-fns');
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const { getByDisplayValue } = render(<CreateWorkoutScreen />);
    expect(getByDisplayValue(today)).toBeTruthy();
  });

  it('calls createWorkout with name and date on submit', async () => {
    useLocalSearchParams.mockReturnValue({ date: '2024-01-15' });
    const { getByPlaceholderText, getByText } = render(<CreateWorkoutScreen />);

    fireEvent.changeText(getByPlaceholderText('e.g. Morning Run'), 'Leg Day');
    fireEvent.press(getByText('Save Workout'));

    await waitFor(() =>
      expect(createWorkout).toHaveBeenCalledWith({ name: 'Leg Day', date: '2024-01-15' })
    );
  });

  it('navigates back after successful save', async () => {
    useLocalSearchParams.mockReturnValue({ date: '2024-01-15' });
    const { getByText } = render(<CreateWorkoutScreen />);
    fireEvent.press(getByText('Save Workout'));
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
  });
});
