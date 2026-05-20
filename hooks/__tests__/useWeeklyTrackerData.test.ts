import { renderHook, waitFor } from '@testing-library/react-native';
import { useWeeklyTrackerData } from '../useWeeklyTrackerData';
import { getWeeklyActivity } from '../../api/workouts';

jest.mock('../../api/workouts');
jest.mock('../../utils/dateUtils', () => ({
  buildWeekDays: () => [
    { date: '2024-01-13', label: 'S' },
    { date: '2024-01-14', label: 'S' },
    { date: '2024-01-15', label: 'M' },
    { date: '2024-01-16', label: 'T' },
    { date: '2024-01-17', label: 'W' },
    { date: '2024-01-18', label: 'T' },
    { date: '2024-01-19', label: 'F' },
  ],
}));

const mockGetWeeklyActivity = getWeeklyActivity as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('useWeeklyTrackerData', () => {
  it('maps activity data to day cells with workoutId', async () => {
    mockGetWeeklyActivity.mockResolvedValue({
      '2024-01-15': { workoutId: 'abc', date: '2024-01-15' },
    });

    const { result } = renderHook(() => useWeeklyTrackerData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const monday = result.current.days.find((d) => d.date === '2024-01-15');
    expect(monday?.hasActivity).toBe(true);
    expect(monday?.workoutId).toBe('abc');
  });

  it('marks days without activity correctly', async () => {
    mockGetWeeklyActivity.mockResolvedValue({});

    const { result } = renderHook(() => useWeeklyTrackerData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    result.current.days.forEach((day) => {
      expect(day.hasActivity).toBe(false);
      expect(day.workoutId).toBeUndefined();
    });
  });

  it('returns 7 days', async () => {
    mockGetWeeklyActivity.mockResolvedValue({});

    const { result } = renderHook(() => useWeeklyTrackerData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.days).toHaveLength(7);
  });

  it('re-fetches when refresh is called', async () => {
    mockGetWeeklyActivity.mockResolvedValue({});

    const { result } = renderHook(() => useWeeklyTrackerData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    result.current.refresh();

    await waitFor(() => expect(mockGetWeeklyActivity).toHaveBeenCalledTimes(2));
  });

  it('for a day with multiple workouts, uses the first occurrence (API deduplication)', async () => {
    mockGetWeeklyActivity.mockResolvedValue({
      '2024-01-15': { workoutId: 'first', date: '2024-01-15' },
    });

    const { result } = renderHook(() => useWeeklyTrackerData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const monday = result.current.days.find((d) => d.date === '2024-01-15');
    expect(monday?.workoutId).toBe('first');
  });
});
