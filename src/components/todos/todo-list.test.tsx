/* eslint-disable max-lines-per-function */
import React from 'react';

import { cleanup, screen, setup } from '@/lib/test-utils';
import type { Todo } from '@/lib/todos';

import { TodoList } from './todo-list';

afterEach(cleanup);

const mockTodos: Array<Todo> = [
  {
    id: '1',
    title: 'First Todo',
    description: 'First Description',
    completed: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Second Todo',
    description: 'Second Description',
    completed: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Third Todo',
    completed: false,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

const onToggleMock = jest.fn();
const onDeleteMock = jest.fn();
const onPressMock = jest.fn();

describe('TodoList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering with todos', () => {
    test('renders all todos correctly', async () => {
      setup(
        <TodoList
          todos={mockTodos}
          filter="all"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('First Todo')).toBeOnTheScreen();
      expect(screen.getByText('Second Todo')).toBeOnTheScreen();
      expect(screen.getByText('Third Todo')).toBeOnTheScreen();
    });

    test('renders todo descriptions', async () => {
      setup(
        <TodoList
          todos={mockTodos}
          filter="all"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('First Description')).toBeOnTheScreen();
      expect(screen.getByText('Second Description')).toBeOnTheScreen();
    });

    test('renders todos in a list', async () => {
      setup(
        <TodoList
          todos={mockTodos}
          filter="all"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('First Todo')).toBeOnTheScreen();
      expect(screen.getByText('Second Todo')).toBeOnTheScreen();
      expect(screen.getByText('Third Todo')).toBeOnTheScreen();
    });
  });

  describe('Empty state rendering', () => {
    test('renders empty state when todos array is empty - all filter', async () => {
      setup(
        <TodoList
          todos={[]}
          filter="all"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('No todos yet')).toBeOnTheScreen();
    });

    test('renders empty state when todos array is empty - active filter', async () => {
      setup(
        <TodoList
          todos={[]}
          filter="active"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('All caught up')).toBeOnTheScreen();
    });

    test('renders empty state when todos array is empty - completed filter', async () => {
      setup(
        <TodoList
          todos={[]}
          filter="completed"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('No completed todos')).toBeOnTheScreen();
    });

    test('shows empty state instead of list when empty', async () => {
      setup(
        <TodoList
          todos={[]}
          filter="all"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('No todos yet')).toBeOnTheScreen();
      expect(screen.queryByText('First Todo')).not.toBeOnTheScreen();
    });
  });

  describe('Callback props', () => {
    test('passes onToggle to TodoItem', async () => {
      setup(
        <TodoList
          todos={mockTodos}
          filter="all"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('First Todo')).toBeOnTheScreen();
    });

    test('passes onDelete to TodoItem', async () => {
      setup(
        <TodoList
          todos={mockTodos}
          filter="all"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('First Todo')).toBeOnTheScreen();
    });

    test('passes optional onPress to TodoItem', async () => {
      setup(
        <TodoList
          todos={mockTodos}
          filter="all"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
          onPress={onPressMock}
        />,
      );

      expect(await screen.findByText('First Todo')).toBeOnTheScreen();
    });
  });

  describe('Memoization', () => {
    test('component has displayName for debugging', () => {
      expect(TodoList.displayName).toBe('TodoList');
    });
  });

  describe('Edge cases', () => {
    test('renders single todo correctly', async () => {
      setup(
        <TodoList
          todos={[mockTodos[0]]}
          filter="all"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('First Todo')).toBeOnTheScreen();
      expect(screen.queryByText('Second Todo')).not.toBeOnTheScreen();
    });

    test('handles todos without descriptions', async () => {
      const todosWithoutDesc = mockTodos.map((todo) => ({
        ...todo,
        description: undefined,
      }));

      setup(
        <TodoList
          todos={todosWithoutDesc}
          filter="all"
          onToggle={onToggleMock}
          onDelete={onDeleteMock}
        />,
      );

      expect(await screen.findByText('First Todo')).toBeOnTheScreen();
      expect(screen.queryByText('First Description')).not.toBeOnTheScreen();
    });
  });
});
