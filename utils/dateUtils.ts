import { format, subDays, startOfDay } from 'date-fns';

export interface WeekDay {
  date: string;
  label: string;
}

export function buildWeekDays(referenceDate: Date = new Date()): WeekDay[] {
  const today = startOfDay(referenceDate);
  return Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i);
    return {
      date: format(day, 'yyyy-MM-dd'),
      label: format(day, 'EEE')[0],
    };
  });
}

export function isFutureDate(dateString: string): boolean {
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
  return dateString > today;
}
