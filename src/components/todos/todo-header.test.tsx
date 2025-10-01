/* eslint-disable max-lines-per-function */
import React from 'react';

import { cleanup, fireEvent, screen, setup } from '@/lib/test-utils';

import { TodoHeader } from './todo-header';

afterEach(cleanup);

const onClearCompletedMock = jest.fn();

describe('TodoHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders title correctly', async () => {
      setup(
        <TodoHeader
          completedCount={0}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(await screen.findByText('My Todos')).toBeOnTheScreen();
    });

    test('does not show clear button when completedCount is 0', async () => {
      setup(
        <TodoHeader
          completedCount={0}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(
        screen.queryByTestId('clear-completed-button'),
      ).not.toBeOnTheScreen();
      expect(screen.queryByText('Clear')).not.toBeOnTheScreen();
    });

    test('shows clear button when completedCount is greater than 0', async () => {
      setup(
        <TodoHeader
          completedCount={5}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(
        await screen.findByTestId('clear-completed-button'),
      ).toBeOnTheScreen();
      expect(screen.getByText('Clear')).toBeOnTheScreen();
    });

    test('displays completed count message when count is greater than 0', async () => {
      setup(
        <TodoHeader
          completedCount={3}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(await screen.findByText('3 completed')).toBeOnTheScreen();
    });

    test('does not display completed count message when count is 0', async () => {
      setup(
        <TodoHeader
          completedCount={0}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(screen.queryByText(/completed/i)).not.toBeOnTheScreen();
    });

    test('shows loading state on clear button when isClearing is true', async () => {
      setup(
        <TodoHeader
          completedCount={5}
          onClearCompleted={onClearCompletedMock}
          isClearing={true}
        />,
      );

      const clearButton = await screen.findByTestId('clear-completed-button');
      expect(clearButton).toBeDisabled();
    });
  });

  describe('Clear Button Interaction', () => {
    test('calls onClearCompleted when clear button is pressed', async () => {
      setup(
        <TodoHeader
          completedCount={5}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      const clearButton = await screen.findByTestId('clear-completed-button');
      fireEvent.press(clearButton);

      expect(onClearCompletedMock).toHaveBeenCalledTimes(1);
    });

    test('does not call onClearCompleted when button is disabled', async () => {
      setup(
        <TodoHeader
          completedCount={5}
          onClearCompleted={onClearCompletedMock}
          isClearing={true}
        />,
      );

      const clearButton = await screen.findByTestId('clear-completed-button');
      fireEvent.press(clearButton);

      expect(onClearCompletedMock).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles single completed todo correctly', async () => {
      setup(
        <TodoHeader
          completedCount={1}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(await screen.findByText('1 completed')).toBeOnTheScreen();
    });

    test('handles large completed count correctly', async () => {
      setup(
        <TodoHeader
          completedCount={999}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(await screen.findByText('999 completed')).toBeOnTheScreen();
    });
  });
});
