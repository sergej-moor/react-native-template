/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import React from 'react';

import { cleanup, fireEvent, screen, setup } from '@/lib/test-utils';

import { TodoFiltersComponent } from './todo-filters';

afterEach(cleanup);

const onFilterChangeMock = jest.fn();

const defaultStats = {
  all: 10,
  active: 5,
  completed: 5,
};

describe('TodoFiltersComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders all filter buttons', async () => {
      setup(
        <TodoFiltersComponent
          activeFilter="all"
          onFilterChange={onFilterChangeMock}
          stats={defaultStats}
        />,
      );

      expect(await screen.findByText('All')).toBeOnTheScreen();
      expect(screen.getByText('Active')).toBeOnTheScreen();
      expect(screen.getByText('Completed')).toBeOnTheScreen();
    });

    test('displays correct counts for each filter', async () => {
      setup(
        <TodoFiltersComponent
          activeFilter="all"
          onFilterChange={onFilterChangeMock}
          stats={defaultStats}
        />,
      );

      expect(await screen.findByText('10')).toBeOnTheScreen();
      const fiveTexts = screen.getAllByText('5');
      expect(fiveTexts.length).toBe(2);
    });

    test('renders with selected filter', async () => {
      setup(
        <TodoFiltersComponent
          activeFilter="active"
          onFilterChange={onFilterChangeMock}
          stats={defaultStats}
        />,
      );

      expect(await screen.findByText('Active')).toBeOnTheScreen();
      expect(screen.getByText('All')).toBeOnTheScreen();
      expect(screen.getByText('Completed')).toBeOnTheScreen();
    });
  });

  describe('Filter Interaction', () => {
    test('calls onFilterChange with "all" when All button is pressed', async () => {
      setup(
        <TodoFiltersComponent
          activeFilter="active"
          onFilterChange={onFilterChangeMock}
          stats={defaultStats}
        />,
      );

      const allButton = await screen.findByText('All');
      fireEvent.press(allButton);

      expect(onFilterChangeMock).toHaveBeenCalledWith('all');
      expect(onFilterChangeMock).toHaveBeenCalledTimes(1);
    });

    test('calls onFilterChange with "active" when Active button is pressed', async () => {
      setup(
        <TodoFiltersComponent
          activeFilter="all"
          onFilterChange={onFilterChangeMock}
          stats={defaultStats}
        />,
      );

      const activeButton = await screen.findByText('Active');
      fireEvent.press(activeButton);

      expect(onFilterChangeMock).toHaveBeenCalledWith('active');
    });

    test('calls onFilterChange with "completed" when Completed button is pressed', async () => {
      setup(
        <TodoFiltersComponent
          activeFilter="all"
          onFilterChange={onFilterChangeMock}
          stats={defaultStats}
        />,
      );

      const completedButton = await screen.findByText('Completed');
      fireEvent.press(completedButton);

      expect(onFilterChangeMock).toHaveBeenCalledWith('completed');
    });
  });

  describe('Interaction', () => {
    test('filters are interactive', async () => {
      setup(
        <TodoFiltersComponent
          activeFilter="all"
          onFilterChange={onFilterChangeMock}
          stats={defaultStats}
        />,
      );

      const allButton = await screen.findByText('All');
      const activeButton = screen.getByText('Active');
      const completedButton = screen.getByText('Completed');

      expect(allButton).toBeOnTheScreen();
      expect(activeButton).toBeOnTheScreen();
      expect(completedButton).toBeOnTheScreen();
    });
  });

  describe('Edge Cases', () => {
    test('renders correctly with zero stats', async () => {
      setup(
        <TodoFiltersComponent
          activeFilter="all"
          onFilterChange={onFilterChangeMock}
          stats={{ all: 0, active: 0, completed: 0 }}
        />,
      );

      const counts = await screen.findAllByText('0');
      expect(counts).toHaveLength(3);
    });

    test('renders correctly with large numbers', async () => {
      setup(
        <TodoFiltersComponent
          activeFilter="all"
          onFilterChange={onFilterChangeMock}
          stats={{ all: 999, active: 500, completed: 499 }}
        />,
      );

      expect(await screen.findByText('999')).toBeOnTheScreen();
      expect(screen.getByText('500')).toBeOnTheScreen();
      expect(screen.getByText('499')).toBeOnTheScreen();
    });
  });
});
