/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { Todo } from './types';
import {
  filterTodos,
  generateTodoId,
  getTodoStats,
  sortTodos,
  validateTodoDescription,
  validateTodoTitle,
} from './utils';

describe('Todo Utils', () => {
  const mockTodos: Array<Todo> = [
    {
      id: '1',
      title: 'Zebra Todo',
      description: 'First todo',
      completed: false,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
    },
    {
      id: '2',
      title: 'Apple Todo',
      description: 'Second todo',
      completed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      title: 'Mango Todo',
      completed: false,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z',
    },
    {
      id: '4',
      title: 'Banana Todo',
      completed: true,
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  describe('filterTodos', () => {
    test('returns all todos when filter is "all"', () => {
      const result = filterTodos(mockTodos, 'all');

      expect(result).toHaveLength(4);
      expect(result).toEqual(mockTodos);
    });

    test('returns only active todos when filter is "active"', () => {
      const result = filterTodos(mockTodos, 'active');

      expect(result).toHaveLength(2);
      expect(result.every((todo) => !todo.completed)).toBe(true);
      expect(result.map((t) => t.id)).toEqual(['1', '3']);
    });

    test('returns only completed todos when filter is "completed"', () => {
      const result = filterTodos(mockTodos, 'completed');

      expect(result).toHaveLength(2);
      expect(result.every((todo) => todo.completed)).toBe(true);
      expect(result.map((t) => t.id)).toEqual(['2', '4']);
    });

    test('returns empty array when no todos match filter', () => {
      const result = filterTodos([], 'active');

      expect(result).toEqual([]);
    });

    test('handles empty array', () => {
      const result = filterTodos([], 'all');

      expect(result).toEqual([]);
    });
  });

  describe('sortTodos', () => {
    test('sorts by createdAt in descending order', () => {
      const result = sortTodos(mockTodos, 'createdAt');

      expect(result[0].id).toBe('4');
      expect(result[1].id).toBe('1');
      expect(result[2].id).toBe('3');
      expect(result[3].id).toBe('2');
    });

    test('sorts by updatedAt in descending order', () => {
      const result = sortTodos(mockTodos, 'updatedAt');

      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('2');
      expect(result[3].id).toBe('4');
    });

    test('sorts by title in ascending alphabetical order', () => {
      const result = sortTodos(mockTodos, 'title');

      expect(result[0].title).toBe('Apple Todo');
      expect(result[1].title).toBe('Banana Todo');
      expect(result[2].title).toBe('Mango Todo');
      expect(result[3].title).toBe('Zebra Todo');
    });

    test('does not mutate original array', () => {
      const original = [...mockTodos];
      sortTodos(mockTodos, 'title');

      expect(mockTodos).toEqual(original);
    });

    test('handles empty array', () => {
      const result = sortTodos([], 'createdAt');

      expect(result).toEqual([]);
    });

    test('handles single item array', () => {
      const singleTodo = [mockTodos[0]];
      const result = sortTodos(singleTodo, 'title');

      expect(result).toEqual(singleTodo);
    });
  });

  describe('getTodoStats', () => {
    test('returns correct stats for mixed todos', () => {
      const result = getTodoStats(mockTodos);

      expect(result).toEqual({
        total: 4,
        active: 2,
        completed: 2,
      });
    });

    test('returns correct stats when all todos are completed', () => {
      const completedTodos = mockTodos.map((t) => ({ ...t, completed: true }));
      const result = getTodoStats(completedTodos);

      expect(result).toEqual({
        total: 4,
        active: 0,
        completed: 4,
      });
    });

    test('returns correct stats when all todos are active', () => {
      const activeTodos = mockTodos.map((t) => ({ ...t, completed: false }));
      const result = getTodoStats(activeTodos);

      expect(result).toEqual({
        total: 4,
        active: 4,
        completed: 0,
      });
    });

    test('returns zero stats for empty array', () => {
      const result = getTodoStats([]);

      expect(result).toEqual({
        total: 0,
        active: 0,
        completed: 0,
      });
    });

    test('handles single todo correctly', () => {
      const result = getTodoStats([mockTodos[0]]);

      expect(result).toEqual({
        total: 1,
        active: 1,
        completed: 0,
      });
    });
  });

  describe('validateTodoTitle', () => {
    test('returns valid for normal title', () => {
      const result = validateTodoTitle('Buy groceries');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('trims whitespace before validation', () => {
      const result = validateTodoTitle('  Valid Title  ');

      expect(result.valid).toBe(true);
    });

    test('returns error when title is empty', () => {
      const result = validateTodoTitle('');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    test('returns error when title is only whitespace', () => {
      const result = validateTodoTitle('   ');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    test('returns error when title exceeds 200 characters', () => {
      const longTitle = 'a'.repeat(201);
      const result = validateTodoTitle(longTitle);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title must be 200 characters or less');
    });

    test('accepts title with exactly 200 characters', () => {
      const maxTitle = 'a'.repeat(200);
      const result = validateTodoTitle(maxTitle);

      expect(result.valid).toBe(true);
    });

    test('accepts title with special characters', () => {
      const result = validateTodoTitle('Buy milk & eggs! 🥛🥚');

      expect(result.valid).toBe(true);
    });

    test('accepts title with numbers', () => {
      const result = validateTodoTitle('Complete 123 tasks');

      expect(result.valid).toBe(true);
    });
  });

  describe('validateTodoDescription', () => {
    test('returns valid for normal description', () => {
      const result = validateTodoDescription('This is a description');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('returns valid for undefined description', () => {
      const result = validateTodoDescription(undefined);

      expect(result.valid).toBe(true);
    });

    test('returns valid for empty description', () => {
      const result = validateTodoDescription('');

      expect(result.valid).toBe(true);
    });

    test('returns error when description exceeds 1000 characters', () => {
      const longDesc = 'a'.repeat(1001);
      const result = validateTodoDescription(longDesc);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Description must be 1000 characters or less');
    });

    test('accepts description with exactly 1000 characters', () => {
      const maxDesc = 'a'.repeat(1000);
      const result = validateTodoDescription(maxDesc);

      expect(result.valid).toBe(true);
    });

    test('accepts multi-line description', () => {
      const multiLine = 'Line 1\nLine 2\nLine 3';
      const result = validateTodoDescription(multiLine);

      expect(result.valid).toBe(true);
    });

    test('accepts description with special characters', () => {
      const result = validateTodoDescription('Buy: milk, eggs & bread! 🛒');

      expect(result.valid).toBe(true);
    });
  });

  describe('generateTodoId', () => {
    test('generates a unique id', () => {
      const id1 = generateTodoId();
      const id2 = generateTodoId();

      expect(id1).not.toBe(id2);
    });

    test('generates id in expected format (timestamp-random)', () => {
      const id = generateTodoId();

      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });

    test('generates id with timestamp component', () => {
      const beforeTime = Date.now();
      const id = generateTodoId();
      const afterTime = Date.now();

      const timestamp = parseInt(id.split('-')[0], 10);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });

    test('generates multiple unique ids in succession', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTodoId());
      }

      expect(ids.size).toBe(100);
    });

    test('generates id as a string', () => {
      const id = generateTodoId();

      expect(typeof id).toBe('string');
    });
  });
});
