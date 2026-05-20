import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DayCell, DayCellData } from '../DayCell';

const baseDay: DayCellData = {
  date: '2024-01-15',
  label: 'M',
  hasActivity: false,
};

describe('DayCell', () => {
  it('calls onPress with the day data when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<DayCell day={baseDay} onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(baseDay);
  });

  it('has correct accessibility label for a day with no activity', () => {
    const { getByLabelText } = render(
      <DayCell day={baseDay} onPress={jest.fn()} />
    );
    expect(getByLabelText('M, no workout logged')).toBeTruthy();
  });

  it('has correct accessibility label for a day with activity', () => {
    const activeDay: DayCellData = { ...baseDay, hasActivity: true, workoutId: 'w1' };
    const { getByLabelText } = render(
      <DayCell day={activeDay} onPress={jest.fn()} />
    );
    expect(getByLabelText('M, workout logged')).toBeTruthy();
  });

  it('renders a check icon when the day has activity', () => {
    const activeDay: DayCellData = { ...baseDay, hasActivity: true, workoutId: 'w1' };
    const { UNSAFE_queryByType } = render(
      <DayCell day={activeDay} onPress={jest.fn()} />
    );
    // CheckIcon should be present; absence of crash validates render
    expect(UNSAFE_queryByType(require('../../icons/CheckIcon').CheckIcon)).toBeTruthy();
  });

  it('does not render a check icon when the day has no activity', () => {
    const { UNSAFE_queryByType } = render(
      <DayCell day={baseDay} onPress={jest.fn()} />
    );
    expect(UNSAFE_queryByType(require('../../icons/CheckIcon').CheckIcon)).toBeNull();
  });
});
