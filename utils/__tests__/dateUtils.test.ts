import { buildWeekDays, isFutureDate } from '../dateUtils';
import { format, subDays, startOfDay } from 'date-fns';

describe('buildWeekDays', () => {
  it('returns exactly 7 days', () => {
    expect(buildWeekDays()).toHaveLength(7);
  });

  it('last entry is today', () => {
    const days = buildWeekDays();
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    expect(days[days.length - 1].date).toBe(today);
  });

  it('first entry is 6 days ago', () => {
    const days = buildWeekDays();
    const sixDaysAgo = format(subDays(startOfDay(new Date()), 6), 'yyyy-MM-dd');
    expect(days[0].date).toBe(sixDaysAgo);
  });

  it('handles month boundary correctly', () => {
    const march1 = new Date('2024-03-01T12:00:00');
    const days = buildWeekDays(march1);
    expect(days[0].date).toBe('2024-02-24');
    expect(days[6].date).toBe('2024-03-01');
  });

  it('each day label is a single character', () => {
    buildWeekDays().forEach(({ label }) => {
      expect(label).toHaveLength(1);
    });
  });

  it('dates are in ascending order', () => {
    const days = buildWeekDays();
    for (let i = 1; i < days.length; i++) {
      expect(days[i].date > days[i - 1].date).toBe(true);
    }
  });
});

describe('isFutureDate', () => {
  it('returns true for a far future date', () => {
    expect(isFutureDate('2099-01-01')).toBe(true);
  });

  it('returns false for today', () => {
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    expect(isFutureDate(today)).toBe(false);
  });

  it('returns false for a past date', () => {
    expect(isFutureDate('2000-01-01')).toBe(false);
  });
});
