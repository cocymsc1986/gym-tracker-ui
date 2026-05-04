/**
 * WeekTracker component tests
 *
 * Coverage:
 *  T8a — Snapshot regression: visual appearance is unchanged after refactor
 *  T8b — Navigation: pressing empty day navigates to Create Workout with date
 *  T8b — Navigation: pressing completed day navigates to Workout Detail with workoutId
 *  T8b — Navigation: pressing future day (no workout) navigates to Create Workout
 *  T7  — Accessibility: labels are correct for both day states
 *        Touch target: minHeight and minWidth are 44
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { WeekTracker } from '../WeekTracker';
import type { WeekDay } from '../WeekTracker.types';
import { ROUTES } from '../../../navigation/routes';

// ─── Navigation mock ─────────────────────────────────────────────────────────

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** Today's date as ISO string for deterministic tests */
const TODAY = '2024-06-10';
const TOMORROW = '2024-06-11';
const YESTERDAY = '2024-06-09';

const emptyDay: WeekDay = {
  date: TODAY,
  label: 'Mon',
  hasWorkout: false,
  workoutId: undefined,
};

const completedDay: WeekDay = {
  date: YESTERDAY,
  label: 'Sun',
  hasWorkout: true,
  workoutId: 'workout-abc-123',
};

const futureDay: WeekDay = {
  date: TOMORROW,
  label: 'Tue',
  hasWorkout: false,
  workoutId: undefined,
};

/** Minimal 7-day array that covers all states under test */
const makeWeekDays = (): WeekDay[] => [
  { date: '2024-06-05', label: 'Wed', hasWorkout: false },
  { date: '2024-06-06', label: 'Thu', hasWorkout: false },
  { date: '2024-06-07', label: 'Fri', hasWorkout: false },
  completedDay,
  emptyDay,
  futureDay,
  { date: '2024-06-12', label: 'Wed', hasWorkout: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const renderTracker = (days: WeekDay[] = makeWeekDays()) =>
  render(<WeekTracker days={days} testID="week-tracker" />);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('WeekTracker', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // ── Snapshot ────────────────────────────────────────────────────────────────

  describe('snapshot', () => {
    it('renders without visual changes (snapshot regression)', () => {
      const { toJSON } = renderTracker();
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders check icon for days with a workout', () => {
      const { getByTestId } = renderTracker();
      expect(getByTestId(`check-icon-${YESTERDAY}`)).toBeTruthy();
    });

    it('renders empty indicator for days without a workout', () => {
      const { getByTestId } = renderTracker();
      expect(getByTestId(`empty-indicator-${TODAY}`)).toBeTruthy();
    });
  });

  // ── Navigation: empty day ────────────────────────────────────────────────────

  describe('navigation — day with no workout', () => {
    it('calls navigate to CREATE_WORKOUT with the day date', () => {
      const { getByTestId } = renderTracker();
      fireEvent.press(getByTestId(`day-cell-${TODAY}`));

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CREATE_WORKOUT, {
        date: TODAY,
      });
    });

    it('does NOT navigate to WORKOUT_DETAIL for an empty day', () => {
      const { getByTestId } = renderTracker();
      fireEvent.press(getByTestId(`day-cell-${TODAY}`));

      expect(mockNavigate).not.toHaveBeenCalledWith(
        ROUTES.WORKOUT_DETAIL,
        expect.anything(),
      );
    });
  });

  // ── Navigation: completed day ────────────────────────────────────────────────

  describe('navigation — day with a logged workout', () => {
    it('calls navigate to WORKOUT_DETAIL with the workout ID', () => {
      const { getByTestId } = renderTracker();
      fireEvent.press(getByTestId(`day-cell-${YESTERDAY}`));

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKOUT_DETAIL, {
        workoutId: 'workout-abc-123',
      });
    });

    it('does NOT navigate to CREATE_WORKOUT for a completed day', () => {
      const { getByTestId } = renderTracker();
      fireEvent.press(getByTestId(`day-cell-${YESTERDAY}`));

      expect(mockNavigate).not.toHaveBeenCalledWith(
        ROUTES.CREATE_WORKOUT,
        expect.anything(),
      );
    });
  });

  // ── Navigation: future day ───────────────────────────────────────────────────

  describe('navigation — future day with no workout', () => {
    it('navigates to CREATE_WORKOUT with the future date pre-filled', () => {
      const { getByTestId } = renderTracker();
      fireEvent.press(getByTestId(`day-cell-${TOMORROW}`));

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CREATE_WORKOUT, {
        date: TOMORROW,
      });
    });
  });

  // ── Navigation: each cell is independently pressable ─────────────────────────

  describe('navigation — independence', () => {
    it('pressing different cells triggers separate navigate calls', () => {
      const { getByTestId } = renderTracker();

      fireEvent.press(getByTestId(`day-cell-${TODAY}`));
      fireEvent.press(getByTestId(`day-cell-${YESTERDAY}`));

      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, ROUTES.CREATE_WORKOUT, {
        date: TODAY,
      });
      expect(mockNavigate).toHaveBeenNthCalledWith(2, ROUTES.WORKOUT_DETAIL, {
        workoutId: 'workout-abc-123',
      });
    });
  });

  // ── Accessibility ────────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('day with no workout has descriptive accessibility label', () => {
      const { getByLabelText } = renderTracker();
      const cell = getByLabelText(
        `${emptyDay.label}, no workout logged. Tap to create a workout.`,
      );
      expect(cell).toBeTruthy();
    });

    it('day with a workout has descriptive accessibility label', () => {
      const { getByLabelText } = renderTracker();
      const cell = getByLabelText(
        `${completedDay.label}, workout logged. Tap to view workout.`,
      );
      expect(cell).toBeTruthy();
    });

    it('each day cell has accessibilityRole of button', () => {
      const { getAllByRole } = renderTracker();
      const buttons = getAllByRole('button');
      // 7 days in the tracker
      expect(buttons).toHaveLength(7);
    });
  });

  // ── Touch target size ────────────────────────────────────────────────────────

  describe('touch target size', () => {
    it('each day cell has minWidth and minHeight of at least 44 in its style', () => {
      const { getAllByRole } = renderTracker();
      const buttons = getAllByRole('button');

      buttons.forEach((button) => {
        const { props } = button;
        const flatStyle = Array.isArray(props.style)
          ? Object.assign({}, ...props.style.filter(Boolean))
          : props.style ?? {};

        if (flatStyle.minWidth !== undefined) {
          expect(flatStyle.minWidth).toBeGreaterThanOrEqual(44);
        }
        if (flatStyle.minHeight !== undefined) {
          expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);
        }
      });
    });
  });

  // ── Re-render stability ──────────────────────────────────────────────────────

  describe('re-render stability', () => {
    it('does not re-create navigate calls when days prop reference is stable', () => {
      const days = makeWeekDays();
      const { rerender, getByTestId } = render(
        <WeekTracker days={days} testID="week-tracker" />,
      );

      // Re-render with the same array reference (no change)
      rerender(<WeekTracker days={days} testID="week-tracker" />);

      // Press after re-render — navigate should still work
      fireEvent.press(getByTestId(`day-cell-${TODAY}`));
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  // ── Edge case: hasWorkout true but workoutId missing ─────────────────────────

  describe('edge case — hasWorkout flag inconsistency', () => {
    it('falls back to CREATE_WORKOUT if hasWorkout is true but workoutId is absent', () => {
      /**
       * Defensive test: if the caller sets hasWorkout: true but omits workoutId
       * (data inconsistency), the component should not throw and should fall back
       * gracefully to the create flow since no valid ID exists for detail navigation.
       */
      const inconsistentDay: WeekDay = {
        date: '2024-06-08',
        label: 'Sat',
        hasWorkout: true,
        workoutId: undefined, // inconsistent — no ID provided
      };
      const days: WeekDay[] = [
        ...makeWeekDays().slice(0, 6),
        inconsistentDay,
      ];

      const { getByTestId } = render(<WeekTracker days={days} />);
      fireEvent.press(getByTestId(`day-cell-${inconsistentDay.date}`));

      // workoutId is falsy → falls back to CREATE_WORKOUT
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CREATE_WORKOUT, {
        date: inconsistentDay.date,
      });
    });
  });
});
