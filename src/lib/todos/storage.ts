import { getItem, setItem } from '@/lib/storage';

import type { Todo } from './types';

const TODOS_STORAGE_KEY = 'todos';

export function getTodos(): Array<Todo> {
  try {
    const todos = getItem<Array<Todo>>(TODOS_STORAGE_KEY);
    if (!todos || !Array.isArray(todos)) {
      return [];
    }
    return todos.filter((todo) => !todo.deletedAt);
  } catch (error) {
    console.error('Error getting todos from storage:', error);
    return [];
  }
}

export function getTodoById(id: string): Todo | null {
  try {
    const todos = getTodos();
    return todos.find((todo) => todo.id === id) ?? null;
  } catch (error) {
    console.error('Error getting todo by id:', error);
    return null;
  }
}

export async function saveTodos(todos: Array<Todo>): Promise<void> {
  try {
    await setItem(TODOS_STORAGE_KEY, todos);
  } catch (error) {
    console.error('Error saving todos to storage:', error);
    throw new Error('Failed to save todos');
  }
}

export async function addTodo(todo: Todo): Promise<Todo> {
  try {
    const todos = getAllTodosIncludingDeleted();
    const newTodos = [...todos, todo];
    await saveTodos(newTodos);
    return todo;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw new Error('Failed to add todo');
  }
}

export async function updateTodo(
  id: string,
  updates: Partial<Todo>,
): Promise<Todo> {
  try {
    const todos = getAllTodosIncludingDeleted();
    const todoIndex = todos.findIndex((todo) => todo.id === id);

    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    const updatedTodo = {
      ...todos[todoIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    todos[todoIndex] = updatedTodo;
    await saveTodos(todos);
    return updatedTodo;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw new Error('Failed to update todo');
  }
}

export async function deleteTodo(id: string): Promise<void> {
  try {
    const todos = getAllTodosIncludingDeleted();
    const todoIndex = todos.findIndex((todo) => todo.id === id);

    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    todos[todoIndex] = {
      ...todos[todoIndex],
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveTodos(todos);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw new Error('Failed to delete todo');
  }
}

export async function restoreTodo(id: string): Promise<Todo> {
  try {
    const todos = getAllTodosIncludingDeleted();
    const todoIndex = todos.findIndex((todo) => todo.id === id);

    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    const restoredTodo = {
      ...todos[todoIndex],
      deletedAt: undefined,
      updatedAt: new Date().toISOString(),
    };

    todos[todoIndex] = restoredTodo;
    await saveTodos(todos);
    return restoredTodo;
  } catch (error) {
    console.error('Error restoring todo:', error);
    throw new Error('Failed to restore todo');
  }
}

export async function permanentlyDeleteTodo(id: string): Promise<void> {
  try {
    const todos = getAllTodosIncludingDeleted();
    const filteredTodos = todos.filter((todo) => todo.id !== id);
    await saveTodos(filteredTodos);
  } catch (error) {
    console.error('Error permanently deleting todo:', error);
    throw new Error('Failed to permanently delete todo');
  }
}

export async function clearCompletedTodos(): Promise<void> {
  try {
    const todos = getAllTodosIncludingDeleted();
    const now = new Date().toISOString();
    const updatedTodos = todos.map((todo) =>
      todo.completed && !todo.deletedAt
        ? { ...todo, deletedAt: now, updatedAt: now }
        : todo,
    );
    await saveTodos(updatedTodos);
  } catch (error) {
    console.error('Error clearing completed todos:', error);
    throw new Error('Failed to clear completed todos');
  }
}

function getAllTodosIncludingDeleted(): Array<Todo> {
  try {
    const todos = getItem<Array<Todo>>(TODOS_STORAGE_KEY);
    return todos ?? [];
  } catch (error) {
    console.error('Error getting all todos:', error);
    return [];
  }
}
