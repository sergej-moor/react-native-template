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
    test('renders "No todos yet" when totalCount is 0', async () => {
      setup(
        <TodoHeader
          totalCount={0}
          completedCount={0}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(await screen.findByText('No todos yet')).toBeOnTheScreen();
    });

    test('renders progress text when there are todos', async () => {
      setup(
        <TodoHeader
          totalCount={10}
          completedCount={5}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(await screen.findByText('5 of 10 completed')).toBeOnTheScreen();
    });

    test('shows progress bar when there are todos', async () => {
      setup(
        <TodoHeader
          totalCount={10}
          completedCount={5}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(await screen.findByText('5 of 10 completed')).toBeOnTheScreen();
    });

    test('clear button is always visible', async () => {
      setup(
        <TodoHeader
          totalCount={10}
          completedCount={0}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      expect(
        await screen.findByTestId('clear-completed-button'),
      ).toBeOnTheScreen();
    });

    test('clear button is disabled when completedCount is 0', async () => {
      setup(
        <TodoHeader
          totalCount={10}
          completedCount={0}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      const clearButton = await screen.findByTestId('clear-completed-button');
      expect(clearButton).toBeDisabled();
    });

    test('clear button is enabled when completedCount is greater than 0', async () => {
      setup(
        <TodoHeader
          totalCount={10}
          completedCount={5}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      const clearButton = await screen.findByTestId('clear-completed-button');
      expect(clearButton).not.toBeDisabled();
    });
  });

  describe('Interaction', () => {
    test('calls onClearCompleted when clear button is pressed', async () => {
      setup(
        <TodoHeader
          totalCount={10}
          completedCount={5}
          onClearCompleted={onClearCompletedMock}
        />,
      );

      const clearButton = await screen.findByTestId('clear-completed-button');
      fireEvent.press(clearButton);

      expect(onClearCompletedMock).toHaveBeenCalledTimes(1);
    });

    test('shows loading state when isClearing is true', async () => {
      setup(
        <TodoHeader
          totalCount={10}
          completedCount={5}
          onClearCompleted={onClearCompletedMock}
          isClearing={true}
        />,
      );

      const clearButton = await screen.findByTestId('clear-completed-button');
      expect(clearButton).toBeOnTheScreen();
    });
  });
});
