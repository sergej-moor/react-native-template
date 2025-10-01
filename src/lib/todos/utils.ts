import type { Todo, TodoFilters, TodoSortBy, TodoStats } from './types';

export function filterTodos(
  todos: Array<Todo>,
  filter: TodoFilters,
): Array<Todo> {
  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo) => todo.completed);
    case 'all':
    default:
      return todos;
  }
}

export function sortTodos(todos: Array<Todo>, sortBy: TodoSortBy): Array<Todo> {
  const sorted = [...todos];

  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'updatedAt':
      return sorted.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    case 'createdAt':
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

export function getTodoStats(todos: Array<Todo>): TodoStats {
  return {
    total: todos.length,
    active: todos.filter((todo) => !todo.completed).length,
    completed: todos.filter((todo) => todo.completed).length,
  };
}

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;

export function validateTodoTitle(title: string): {
  valid: boolean;
  error?: string;
} {
  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    return { valid: false, error: 'Title is required' };
  }

  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: 'Title must be 200 characters or less' };
  }

  return { valid: true };
}

export function validateTodoDescription(description?: string): {
  valid: boolean;
  error?: string;
} {
  if (!description) {
    return { valid: true };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: 'Description must be 1000 characters or less',
    };
  }

  return { valid: true };
}

const RANDOM_STRING_BASE = 36;
const RANDOM_STRING_START = 2;
const RANDOM_STRING_END = 9;

export function generateTodoId(): string {
  return `${Date.now()}-${Math.random().toString(RANDOM_STRING_BASE).substring(RANDOM_STRING_START, RANDOM_STRING_END)}`;
}
