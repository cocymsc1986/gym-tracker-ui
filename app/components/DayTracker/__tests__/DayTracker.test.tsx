import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DayTracker } from '../DayTracker';
import * as wouterModule from 'wouter';

const mockNavigate = vi.fn();

vi.mock('wouter', () => ({
  useNavigate: () => [null, mockNavigate],
}));

describe('DayTracker', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const mockWorkouts = [
    { id: 'w1', date: '2024-01-08' },
    { id: 'w2', date: '2024-01-10' },
  ];

  it('renders all 7 days', () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);
  });

  it('shows check icon for days with workouts', () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const checks = screen.getAllByRole('img');
    expect(checks.length).toBeGreaterThanOrEqual(mockWorkouts.length);
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

    await userEvent.click(buttons[1]);
    expect(mockNavigate).toHaveBeenCalledWith('/workouts/w1');
  });

  it('navigates to create workout page when clicking day without activity', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');

    await userEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringMatching(/^\/workouts\/create\?date=/)
    );
  });

  it('includes date parameter in create route', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');

    await userEvent.click(buttons[0]);
    const callArg = mockNavigate.mock.calls[0][0];
    expect(callArg).toMatch(/date=\d{4}-\d{2}-\d{2}/);
  });

  it('handles multiple clicks across different days', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');

    await userEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    await userEvent.click(buttons[1]);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('keyboard accessible - Enter key triggers navigation', async () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    const firstDay = buttons[0];

    firstDay.focus();
    await userEvent.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalled();
  });
});
