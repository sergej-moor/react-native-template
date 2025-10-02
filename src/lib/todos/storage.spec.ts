/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { getItem, setItem } from '@/lib/storage';

import {
  addTodo,
  clearCompletedTodos,
  deleteTodo,
  getTodoById,
  getTodos,
  permanentlyDeleteTodo,
  restoreTodo,
  saveTodos,
  updateTodo,
} from './storage';
import type { Todo } from './types';

// Mock the storage module
jest.mock('@/lib/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = getItem as jest.MockedFunction<typeof getItem>;
const mockSetItem = setItem as jest.MockedFunction<typeof setItem>;

describe('Todo Storage', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockTodos: Array<Todo> = [
    mockTodo,
    {
      id: '2',
      title: 'Completed Todo',
      completed: true,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      title: 'Deleted Todo',
      completed: false,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      deletedAt: '2024-01-03T12:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTodos', () => {
    test('returns all non-deleted todos from storage', () => {
      mockGetItem.mockReturnValue(mockTodos);

      const result = getTodos();

      expect(result).toHaveLength(2);
      expect(result).toEqual([mockTodos[0], mockTodos[1]]);
      expect(mockGetItem).toHaveBeenCalledWith('todos');
    });

    test('returns empty array when storage is empty', () => {
      mockGetItem.mockReturnValue(null);

      const result = getTodos();

      expect(result).toEqual([]);
    });

    test('returns empty array when storage returns non-array', () => {
      mockGetItem.mockReturnValue({ invalid: 'data' } as never);

      const result = getTodos();

      expect(result).toEqual([]);
    });

    test('handles storage errors gracefully', () => {
      mockGetItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getTodos();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error getting todos from storage:',
        expect.any(Error),
      );
    });

    test('filters out soft-deleted todos', () => {
      mockGetItem.mockReturnValue(mockTodos);

      const result = getTodos();

      expect(result.every((todo) => !todo.deletedAt)).toBe(true);
      expect(result.find((todo) => todo.id === '3')).toBeUndefined();
    });
  });

  describe('getTodoById', () => {
    test('returns todo when found', () => {
      mockGetItem.mockReturnValue(mockTodos);

      const result = getTodoById('1');

      expect(result).toEqual(mockTodo);
    });

    test('returns null when todo not found', () => {
      mockGetItem.mockReturnValue(mockTodos);

      const result = getTodoById('999');

      expect(result).toBeNull();
    });

    test('returns null when todo is deleted', () => {
      mockGetItem.mockReturnValue(mockTodos);

      const result = getTodoById('3');

      expect(result).toBeNull();
    });

    test('handles errors and returns null', () => {
      mockGetItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getTodoById('1');

      expect(result).toBeNull();
      // getTodoById calls getTodos internally, which logs the error
      expect(console.error).toHaveBeenCalledWith(
        'Error getting todos from storage:',
        expect.any(Error),
      );
    });
  });

  describe('saveTodos', () => {
    test('saves todos to storage successfully', async () => {
      mockSetItem.mockResolvedValue(undefined);

      await saveTodos(mockTodos);

      expect(mockSetItem).toHaveBeenCalledWith('todos', mockTodos);
    });

    test('throws error when save fails', async () => {
      mockSetItem.mockRejectedValue(new Error('Storage full'));

      await expect(saveTodos(mockTodos)).rejects.toThrow(
        'Failed to save todos',
      );
      expect(console.error).toHaveBeenCalledWith(
        'Error saving todos to storage:',
        expect.any(Error),
      );
    });
  });

  describe('addTodo', () => {
    test('adds new todo to empty storage', async () => {
      mockGetItem.mockReturnValue(null);
      mockSetItem.mockResolvedValue(undefined);

      const newTodo: Todo = {
        id: '4',
        title: 'New Todo',
        completed: false,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      };

      const result = await addTodo(newTodo);

      expect(result).toEqual(newTodo);
      expect(mockSetItem).toHaveBeenCalledWith('todos', [newTodo]);
    });

    test('adds new todo to existing todos', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      const newTodo: Todo = {
        id: '4',
        title: 'New Todo',
        completed: false,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      };

      const result = await addTodo(newTodo);

      expect(result).toEqual(newTodo);
      expect(mockSetItem).toHaveBeenCalledWith('todos', [
        ...mockTodos,
        newTodo,
      ]);
    });

    test('preserves existing todos including deleted ones', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      const newTodo: Todo = {
        id: '4',
        title: 'New Todo',
        completed: false,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      };

      await addTodo(newTodo);

      const savedTodos = mockSetItem.mock.calls[0][1] as Array<Todo>;
      expect(savedTodos).toHaveLength(4);
      expect(savedTodos.find((t) => t.deletedAt)).toBeDefined();
    });

    test('throws error when add fails', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockRejectedValue(new Error('Storage full'));

      const newTodo: Todo = {
        id: '4',
        title: 'New Todo',
        completed: false,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      };

      await expect(addTodo(newTodo)).rejects.toThrow('Failed to add todo');
      expect(console.error).toHaveBeenCalledWith(
        'Error adding todo:',
        expect.any(Error),
      );
    });
  });

  describe('updateTodo', () => {
    test('updates existing todo successfully', async () => {
      const freshTodos = JSON.parse(JSON.stringify(mockTodos)) as Array<Todo>;
      mockGetItem.mockReturnValue(freshTodos);
      mockSetItem.mockResolvedValue(undefined);

      const updates = { title: 'Updated Title', completed: true };
      const result = await updateTodo('1', updates);

      expect(result.title).toBe('Updated Title');
      expect(result.completed).toBe(true);
      expect(result.updatedAt).not.toBe(mockTodo.updatedAt);
      expect(mockSetItem).toHaveBeenCalled();
    });

    test('updates only specified fields', async () => {
      const freshTodos = JSON.parse(JSON.stringify(mockTodos)) as Array<Todo>;
      const todosWithDescription = [
        { ...freshTodos[0], description: 'Original description' },
        ...freshTodos.slice(1),
      ];
      mockGetItem.mockReturnValue(todosWithDescription);
      mockSetItem.mockResolvedValue(undefined);

      const result = await updateTodo('1', { completed: true });

      expect(result.title).toBe(mockTodo.title);
      expect(result.description).toBe('Original description');
      expect(result.completed).toBe(true);
    });

    test('updates timestamp on every update', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      const beforeUpdate = new Date().toISOString();
      const result = await updateTodo('1', { title: 'New Title' });

      expect(result.updatedAt).not.toBe(mockTodo.updatedAt);
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeUpdate).getTime(),
      );
    });

    test('throws error when todo not found', async () => {
      mockGetItem.mockReturnValue(mockTodos);

      await expect(updateTodo('999', { title: 'New' })).rejects.toThrow(
        'Failed to update todo',
      );
    });

    test('can update deleted todos', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      const result = await updateTodo('3', { title: 'Updated Deleted' });

      expect(result.title).toBe('Updated Deleted');
      expect(result.deletedAt).toBeDefined();
    });

    test('throws error when update fails', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockRejectedValue(new Error('Storage error'));

      await expect(updateTodo('1', { title: 'New' })).rejects.toThrow(
        'Failed to update todo',
      );
      expect(console.error).toHaveBeenCalledWith(
        'Error updating todo:',
        expect.any(Error),
      );
    });
  });

  describe('deleteTodo', () => {
    test('soft deletes todo by setting deletedAt', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      await deleteTodo('1');

      const savedTodos = mockSetItem.mock.calls[0][1] as Array<Todo>;
      const deletedTodo = savedTodos.find((t) => t.id === '1');
      expect(deletedTodo?.deletedAt).toBeDefined();
      expect(deletedTodo?.updatedAt).toBeDefined();
    });

    test('updates both deletedAt and updatedAt timestamps', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      const beforeDelete = new Date().toISOString();
      await deleteTodo('1');

      const savedTodos = mockSetItem.mock.calls[0][1] as Array<Todo>;
      const deletedTodo = savedTodos.find((t) => t.id === '1');
      expect(
        new Date(deletedTodo!.deletedAt!).getTime(),
      ).toBeGreaterThanOrEqual(new Date(beforeDelete).getTime());
      expect(new Date(deletedTodo!.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeDelete).getTime(),
      );
    });

    test('throws error when todo not found', async () => {
      mockGetItem.mockReturnValue(mockTodos);

      await expect(deleteTodo('999')).rejects.toThrow('Failed to delete todo');
    });

    test('can soft delete already deleted todo', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      await deleteTodo('3');

      expect(mockSetItem).toHaveBeenCalled();
    });

    test('throws error when delete fails', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockRejectedValue(new Error('Storage error'));

      await expect(deleteTodo('1')).rejects.toThrow('Failed to delete todo');
      expect(console.error).toHaveBeenCalledWith(
        'Error deleting todo:',
        expect.any(Error),
      );
    });
  });

  describe('restoreTodo', () => {
    test('restores soft-deleted todo', async () => {
      const originalUpdatedAt = mockTodos[2].updatedAt;
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      const result = await restoreTodo('3');

      expect(result.deletedAt).toBeUndefined();
      expect(result.updatedAt).not.toBe(originalUpdatedAt);
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalUpdatedAt).getTime(),
      );
    });

    test('updates timestamp when restoring', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      const beforeRestore = new Date().toISOString();
      const result = await restoreTodo('3');

      expect(new Date(result.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeRestore).getTime(),
      );
    });

    test('can restore non-deleted todo', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      const result = await restoreTodo('1');

      expect(result.deletedAt).toBeUndefined();
      expect(mockSetItem).toHaveBeenCalled();
    });

    test('throws error when todo not found', async () => {
      mockGetItem.mockReturnValue(mockTodos);

      await expect(restoreTodo('999')).rejects.toThrow(
        'Failed to restore todo',
      );
    });

    test('throws error when restore fails', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockRejectedValue(new Error('Storage error'));

      await expect(restoreTodo('3')).rejects.toThrow('Failed to restore todo');
      expect(console.error).toHaveBeenCalledWith(
        'Error restoring todo:',
        expect.any(Error),
      );
    });
  });

  describe('permanentlyDeleteTodo', () => {
    test('permanently removes todo from storage', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      await permanentlyDeleteTodo('1');

      const savedTodos = mockSetItem.mock.calls[0][1] as Array<Todo>;
      expect(savedTodos).toHaveLength(2);
      expect(savedTodos.find((t) => t.id === '1')).toBeUndefined();
    });

    test('removes deleted todos', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      await permanentlyDeleteTodo('3');

      const savedTodos = mockSetItem.mock.calls[0][1] as Array<Todo>;
      expect(savedTodos).toHaveLength(2);
    });

    test('handles non-existent todo gracefully', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      await permanentlyDeleteTodo('999');

      const savedTodos = mockSetItem.mock.calls[0][1] as Array<Todo>;
      expect(savedTodos).toHaveLength(3);
    });

    test('throws error when delete fails', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockRejectedValue(new Error('Storage error'));

      await expect(permanentlyDeleteTodo('1')).rejects.toThrow(
        'Failed to permanently delete todo',
      );
      expect(console.error).toHaveBeenCalledWith(
        'Error permanently deleting todo:',
        expect.any(Error),
      );
    });
  });

  describe('clearCompletedTodos', () => {
    test('soft deletes all completed todos', async () => {
      const freshTodos = JSON.parse(JSON.stringify(mockTodos)) as Array<Todo>;
      mockGetItem.mockReturnValue(freshTodos);
      mockSetItem.mockResolvedValue(undefined);

      await clearCompletedTodos();

      const savedTodos = mockSetItem.mock.calls[0][1] as Array<Todo>;
      const completedTodo = savedTodos.find((t) => t.id === '2');
      expect(completedTodo?.deletedAt).toBeDefined();
    });

    test('does not delete uncompleted todos', async () => {
      const freshTodos = JSON.parse(JSON.stringify(mockTodos)) as Array<Todo>;
      const testTodos = freshTodos.map((t) => ({ ...t, deletedAt: undefined }));
      mockGetItem.mockReturnValue(testTodos);
      mockSetItem.mockResolvedValue(undefined);

      await clearCompletedTodos();

      const savedTodos = mockSetItem.mock.calls[0][1] as Array<Todo>;
      const uncompletedTodo = savedTodos.find((t) => t.id === '1');
      expect(uncompletedTodo?.deletedAt).toBeUndefined();
      expect(uncompletedTodo?.completed).toBe(false);
    });

    test('does not affect already deleted todos', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      const originalDeletedAt = mockTodos[2].deletedAt;
      await clearCompletedTodos();

      const savedTodos = mockSetItem.mock.calls[0][1] as Array<Todo>;
      const alreadyDeleted = savedTodos.find((t) => t.id === '3');
      expect(alreadyDeleted?.deletedAt).toBe(originalDeletedAt);
    });

    test('updates timestamps for cleared todos', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockResolvedValue(undefined);

      const beforeClear = new Date().toISOString();
      await clearCompletedTodos();

      const savedTodos = mockSetItem.mock.calls[0][1] as Array<Todo>;
      const clearedTodo = savedTodos.find((t) => t.id === '2');
      expect(
        new Date(clearedTodo!.deletedAt!).getTime(),
      ).toBeGreaterThanOrEqual(new Date(beforeClear).getTime());
      expect(new Date(clearedTodo!.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeClear).getTime(),
      );
    });

    test('handles empty storage', async () => {
      mockGetItem.mockReturnValue(null);
      mockSetItem.mockResolvedValue(undefined);

      await clearCompletedTodos();

      expect(mockSetItem).toHaveBeenCalledWith('todos', []);
    });

    test('throws error when clear fails', async () => {
      mockGetItem.mockReturnValue(mockTodos);
      mockSetItem.mockRejectedValue(new Error('Storage error'));

      await expect(clearCompletedTodos()).rejects.toThrow(
        'Failed to clear completed todos',
      );
      expect(console.error).toHaveBeenCalledWith(
        'Error clearing completed todos:',
        expect.any(Error),
      );
    });
  });
});
