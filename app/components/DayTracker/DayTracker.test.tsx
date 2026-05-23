import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DayTracker } from './DayTracker';

vi.mock('wouter', () => ({
  useNavigate: () => [null, vi.fn()],
}));

describe('DayTracker', () => {
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
    const buttons = screen.getAllByRole('button');
    const checksCount = buttons.filter(btn => 
      btn.querySelector('[class*="text-green"]')
    ).length;
    expect(checksCount).toBe(mockWorkouts.length);
  });
  
  it('all days are clickable with cursor pointer', () => {
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toHaveClass('cursor-pointer');
    });
  });
  
  it('navigates to workout detail when clicking day with activity', async () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue([null, navigate]);
    
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    
    await userEvent.click(buttons[1]); // Click day with workout
    expect(navigate).toHaveBeenCalledWith(expect.stringMatching(/^\/workouts\/w[0-9]/));
  });
  
  it('navigates to create workout page when clicking day without activity', async () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue([null, navigate]);
    
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    
    await userEvent.click(buttons[0]); // Click day without workout
    expect(navigate).toHaveBeenCalledWith(expect.stringMatching(/^\/workouts\/create\?date=/));
  });
  
  it('passes date parameter to create workout route', async () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue([null, navigate]);
    
    render(<DayTracker workouts={mockWorkouts} />);
    const buttons = screen.getAllByRole('button');
    
    await userEvent.click(buttons[0]);
    const callArg = navigate.mock.calls[0][0];
    expect(callArg).toMatch(/date=\d{4}-\d{2}-\d{2}/);
  });
});
