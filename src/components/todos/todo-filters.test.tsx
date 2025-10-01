import React from 'react';

import { cleanup, fireEvent, screen, setup } from '@/lib/test-utils';

import { TodoFiltersComponent } from './todo-filters';

afterEach(cleanup);

const onFilterChangeMock = jest.fn();

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
        />,
      );

      expect(await screen.findByText('All')).toBeOnTheScreen();
      expect(screen.getByText('Active')).toBeOnTheScreen();
      expect(screen.getByText('Completed')).toBeOnTheScreen();
    });

    test('renders with selected filter', async () => {
      setup(
        <TodoFiltersComponent
          activeFilter="active"
          onFilterChange={onFilterChangeMock}
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
});
