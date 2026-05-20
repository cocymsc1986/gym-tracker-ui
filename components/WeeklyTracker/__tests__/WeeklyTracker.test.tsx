import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { WeeklyTracker } from '../WeeklyTracker';

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('../../../hooks/useWeeklyTrackerData');

const { useWeeklyTrackerData } = require('../../../hooks/useWeeklyTrackerData') as {
  useWeeklyTrackerData: jest.Mock;
};

const Toast = require('react-native-toast-message') as { show: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('WeeklyTracker navigation', () => {
  it('navigates to create workout with date when an empty day is pressed', () => {
    useWeeklyTrackerData.mockReturnValue({
      days: [{ date: '2024-01-15', label: 'M', hasActivity: false }],
      loading: false,
      refresh: mockRefresh,
    });

    const { getByLabelText } = render(<WeeklyTracker />);
    fireEvent.press(getByLabelText('M, no workout logged'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/workout/create',
      params: { date: '2024-01-15' },
    });
  });

  it('navigates to workout detail with workoutId when an active day is pressed', () => {
    useWeeklyTrackerData.mockReturnValue({
      days: [{ date: '2024-01-15', label: 'M', hasActivity: true, workoutId: 'workout-42' }],
      loading: false,
      refresh: mockRefresh,
    });

    const { getByLabelText } = render(<WeeklyTracker />);
    fireEvent.press(getByLabelText('M, workout logged'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/workout/[id]',
      params: { id: 'workout-42' },
    });
  });

  it('navigates to create workout when a future day (no activity) is pressed', () => {
    const futureDate = '2099-12-31';
    useWeeklyTrackerData.mockReturnValue({
      days: [{ date: futureDate, label: 'W', hasActivity: false }],
      loading: false,
      refresh: mockRefresh,
    });

    const { getByLabelText } = render(<WeeklyTracker />);
    fireEvent.press(getByLabelText('W, no workout logged'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/workout/create',
      params: { date: futureDate },
    });
  });

  it('shows a toast and refreshes when an active day has no workoutId (deleted workout)', async () => {
    useWeeklyTrackerData.mockReturnValue({
      days: [{ date: '2024-01-15', label: 'M', hasActivity: true, workoutId: undefined }],
      loading: false,
      refresh: mockRefresh,
    });

    const { getByLabelText } = render(<WeeklyTracker />);
    fireEvent.press(getByLabelText('M, workout logged'));

    expect(mockPush).not.toHaveBeenCalled();
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    );
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it('renders all 7 day cells', () => {
    const days = Array.from({ length: 7 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      label: 'SMTWTFS'[i],
      hasActivity: false,
    }));

    useWeeklyTrackerData.mockReturnValue({ days, loading: false, refresh: mockRefresh });

    const { getAllByRole } = render(<WeeklyTracker />);
    expect(getAllByRole('button')).toHaveLength(7);
  });
});
