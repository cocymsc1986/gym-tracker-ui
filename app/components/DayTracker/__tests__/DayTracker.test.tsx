import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DayTracker } from '../DayTracker';
import { format, startOfWeek, addDays } from 'date-fns';

const mockNavigate = vi.fn();

vi.mock('wouter', () => ({
  useLocation: () => [null, mockNavigate],
}));

vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  const mockNow = new Date('2024-01-08T00:00:00Z'); // Monday
  return {
    ...actual,
  };
});

describe('DayTracker', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-08T00:00:00Z')); // Set to Monday 2024-01-08
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockWorkouts = [
    { id: 'w1', date: '2024-01-08' }, // Monday
    { id: 'w2', date: '2024-01-10' }, // Wednesday
  ];

  it('renders all 7 days', () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);
  });

  it('shows check icon for days with workouts', () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    const buttonsWithCheckIcon = buttons.filter((btn) => {
      return btn.querySelector('svg') !== null;
    });
    expect(buttonsWithCheckIcon).toHaveLength(mockWorkouts.length);
  });

  it('all days are clickable with cursor pointer class', () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveClass('cursor-pointer');
    });
  });

  it('navigates to workout detail when clicking day with activity', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');

    await userEvent.click(buttons[0]); // Monday (2024-01-08) has w1
    expect(mockNavigate).toHaveBeenCalledWith('/workouts/w1');
  });

  it('navigates to create workout page when clicking day without activity', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');

    await userEvent.click(buttons[1]); // Tuesday has no activity
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringMatching(/^\/workouts\/create\?date=2024-01-09/)
    );
  });

  it('includes correct date parameter in create route', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');

    // Click a day without activity
    await userEvent.click(buttons[3]); // Thursday
    const callArg = mockNavigate.mock.calls[0][0];
    expect(callArg).toBe('/workouts/create?date=2024-01-11');
  });

  it('navigates to correct workout for Wednesday with activity', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');

    await userEvent.click(buttons[2]); // Wednesday (2024-01-10) has w2
    expect(mockNavigate).toHaveBeenCalledWith('/workouts/w2');
  });

  it('handles multiple clicks across different days', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');

    await userEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/workouts/w1');

    mockNavigate.mockClear();

    await userEvent.click(buttons[1]);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringMatching(/^\/workouts\/create\?date=/)
    );
  });

  it('keyboard accessible - Enter key triggers navigation', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    const firstDay = buttons[0];

    firstDay.focus();
    await userEvent.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith('/workouts/w1');
  });

  it('keyboard accessible - Space key triggers navigation', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    const secondDay = buttons[1];

    secondDay.focus();
    await userEvent.keyboard(' ');
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringMatching(/^\/workouts\/create\?date=/)
    );
  });

  it('has proper aria-labels for accessibility', () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');

    expect(buttons[0]).toHaveAttribute('aria-label', expect.stringMatching(/completed/));
    expect(buttons[1]).toHaveAttribute('aria-label', expect.stringMatching(/no activity/));
  });
});
