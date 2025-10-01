/* eslint-disable max-lines-per-function */
import React from 'react';

import { cleanup, fireEvent, screen, setup } from '@/lib/test-utils';
import type { Todo } from '@/lib/todos';

import { TodoItem } from './todo-item';

afterEach(cleanup);

const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  description: 'Test Description',
  completed: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const onToggleMock = jest.fn();
const onDeleteMock = jest.fn();
const onPressMock = jest.fn();

describe('TodoItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders todo with title and description', async () => {
      setup(
        <TodoItem
          todo={mockTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('Test Todo')).toBeOnTheScreen();
      expect(screen.getByText('Test Description')).toBeOnTheScreen();
    });

    test('renders todo without description', async () => {
      const todoWithoutDesc = { ...mockTodo, description: undefined };
      setup(
        <TodoItem
          todo={todoWithoutDesc}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('Test Todo')).toBeOnTheScreen();
      expect(screen.queryByText('Test Description')).not.toBeOnTheScreen();
    });

    test('renders completed and uncompleted todos', async () => {
      const completedTodo = { ...mockTodo, completed: true };
      const { rerender } = setup(
        <TodoItem
          todo={completedTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('Test Todo')).toBeOnTheScreen();

      rerender(
        <TodoItem
          todo={mockTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('Test Todo')).toBeOnTheScreen();
    });
  });

  describe('Checkbox Interaction', () => {
    test('calls onToggle with correct arguments when checkbox is pressed', async () => {
      setup(
        <TodoItem
          todo={mockTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      const checkbox = await screen.findByRole('checkbox');
      fireEvent.press(checkbox);

      expect(onToggleMock).toHaveBeenCalledWith('1', true);
      expect(onToggleMock).toHaveBeenCalledTimes(1);
    });

    test('calls onToggle to uncomplete when completed todo checkbox is pressed', async () => {
      const completedTodo = { ...mockTodo, completed: true };
      setup(
        <TodoItem
          todo={completedTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      const checkbox = await screen.findByRole('checkbox');
      fireEvent.press(checkbox);

      expect(onToggleMock).toHaveBeenCalledWith('1', false);
    });

    test('checkbox has accessibility labels', async () => {
      setup(
        <TodoItem
          todo={mockTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      const checkbox = await screen.findByRole('checkbox');
      expect(checkbox).toHaveProp('accessibilityLabel', 'Mark as complete');
    });

    test('completed checkbox has correct accessibility label', async () => {
      const completedTodo = { ...mockTodo, completed: true };
      setup(
        <TodoItem
          todo={completedTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      const checkbox = await screen.findByRole('checkbox');
      expect(checkbox).toHaveProp('accessibilityLabel', 'Mark as incomplete');
    });
  });

  describe('Delete Interaction', () => {
    test('calls onDelete with correct id when delete button is pressed', async () => {
      setup(
        <TodoItem
          todo={mockTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      const deleteButton = await screen.findByLabelText('Delete todo');
      fireEvent.press(deleteButton);

      expect(onDeleteMock).toHaveBeenCalledWith('1');
      expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });

    test('delete button has correct accessibility properties', async () => {
      setup(
        <TodoItem
          todo={mockTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      const deleteButton = await screen.findByLabelText('Delete todo');
      expect(deleteButton).toHaveProp('accessibilityRole', 'button');
    });
  });

  describe('Press Interaction', () => {
    test('calls onPress with correct id when todo is pressed', async () => {
      setup(
        <TodoItem
          todo={mockTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
          onPress={onPressMock}
        />,
      );

      const title = await screen.findByText('Test Todo');
      fireEvent.press(title);

      expect(onPressMock).toHaveBeenCalledWith('1');
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    test('does not crash when onPress is not provided', async () => {
      setup(
        <TodoItem
          todo={mockTodo}
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      const title = await screen.findByText('Test Todo');
      fireEvent.press(title);

      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Memoization', () => {
    test('component has displayName for debugging', () => {
      expect(TodoItem.displayName).toBe('TodoItem');
    });
  });
});
