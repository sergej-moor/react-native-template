---
title: CRUD Operations Guide
description: A step-by-step guide to implementing CRUD operations using the three-layer architecture pattern
---

This guide explains how to implement CRUD (Create, Read, Update, Delete) operations in this React Native template using the proven three-layer architecture pattern. We'll use the todos implementation as a reference example throughout.

## Overview

The CRUD implementation follows a **three-layer architecture**:

1. **Storage Layer** (`src/lib/`) - Handles data persistence (MMKV)
2. **API Layer** (`src/api/`) - React Query hooks for state management
3. **UI Layer** (`src/app/` & `src/components/`) - React components that consume hooks

This separation provides:

- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Reusability**: Storage functions can be used anywhere
- **Type Safety**: Full TypeScript coverage across layers

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         UI Layer (Components)           │
│  Uses hooks, handles user interactions  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      API Layer (React Query Hooks)      │
│  Manages state, caching, optimistic    │
│  updates, error handling                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Storage Layer (MMKV Functions)     │
│  Pure functions for data persistence    │
└─────────────────────────────────────────┘
```

## Step-by-Step Implementation

### Step 1: Define Types (`src/lib/{feature}/types.ts`)

Start by defining your TypeScript types. This serves as the contract for all layers.

```typescript
// src/lib/todos/types.ts
export type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type CreateTodoInput = {
  title: string;
  description?: string;
};

export type UpdateTodoInput = {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
};
```

**Key Points:**

- Use `type` instead of `interface` (project convention)
- Include timestamps (`createdAt`, `updatedAt`) for future sync
- Use `deletedAt?` for soft deletes
- Separate input types from entity types

### Step 2: Create Validation Schema (`src/lib/{feature}/validation.ts`)

Use Zod for runtime validation and type inference.

```typescript
// src/lib/todos/validation.ts
import { z } from 'zod';

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MIN_TITLE_LENGTH = 1;

export const createTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(MIN_TITLE_LENGTH, 'todos.validation.titleRequired')
    .max(MAX_TITLE_LENGTH, 'todos.validation.titleMaxLength'),
  description: z
    .string()
    .trim()
    .max(MAX_DESCRIPTION_LENGTH, 'todos.validation.descriptionMaxLength')
    .optional()
    .or(z.literal('')),
});

// Generate TypeScript type from schema
export type CreateTodoFormData = z.infer<typeof createTodoSchema>;
```

**Benefits:**

- Single source of truth for validation rules
- Automatic TypeScript type generation
- Works seamlessly with `react-hook-form`

### Step 3: Implement Storage Layer (`src/lib/{feature}/storage.ts`)

The storage layer contains pure functions for data persistence. These functions have no React dependencies.

#### Pattern: READ operations return safe defaults

```typescript
// src/lib/todos/storage.ts
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
    return []; // Return safe default, don't throw
  }
}
```

**Why return `[]` instead of throwing?**

- App can continue functioning
- User sees empty list instead of crash
- Common pattern: "fail gracefully for reads"

#### Pattern: WRITE operations throw errors

```typescript
export async function addTodo(todo: Todo): Promise<Todo> {
  try {
    const todos = getAllTodosIncludingDeleted();
    const newTodos = [...todos, todo];
    await saveTodos(newTodos);
    return todo;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw new Error('Failed to add todo'); // Throw so caller knows it failed
  }
}
```

**Why throw instead of returning?**

- Caller needs to know the operation failed
- UI can show error message to user
- Prevents silent failures

#### Pattern: Shared save function

```typescript
export async function saveTodos(todos: Array<Todo>): Promise<void> {
  try {
    await setItem(TODOS_STORAGE_KEY, todos);
  } catch (error) {
    console.error('Error saving todos to storage:', error);
    throw new Error('Failed to save todos');
  }
}
```

**Why extract `saveTodos`?**

- Used by multiple functions (`addTodo`, `updateTodo`, `deleteTodo`, etc.)
- Single place to change save logic
- Follows DRY principle

#### Complete Storage Layer Example

```typescript
// src/lib/todos/storage.ts
import { getItem, setItem } from '@/lib/storage';
import type { Todo } from './types';

const TODOS_STORAGE_KEY = 'todos';

// READ: Return safe defaults
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

// WRITE: Shared save function
export async function saveTodos(todos: Array<Todo>): Promise<void> {
  try {
    await setItem(TODOS_STORAGE_KEY, todos);
  } catch (error) {
    console.error('Error saving todos to storage:', error);
    throw new Error('Failed to save todos');
  }
}

// CREATE
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

// UPDATE
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

// DELETE (soft delete)
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

// Helper function
function getAllTodosIncludingDeleted(): Array<Todo> {
  try {
    const todos = getItem<Array<Todo>>(TODOS_STORAGE_KEY);
    return todos ?? [];
  } catch (error) {
    console.error('Error getting all todos:', error);
    return [];
  }
}
```

### Step 4: Create Query Hook (`src/api/{feature}/use-{feature}.ts`)

Query hooks are for **reading** data. They use `createQuery` from `react-query-kit`.

```typescript
// src/api/todos/use-todos.ts
import { createQuery } from 'react-query-kit';

import type { Todo } from '@/lib/todos';
import { getTodos } from '@/lib/todos';

export const useTodos = createQuery<Array<Todo>>({
  queryKey: ['todos'],
  fetcher: async () => getTodos(),
});
```

**Usage in components:**

```typescript
const { data: todos = [], isLoading, error } = useTodos();
```

**Features:**

- Automatic caching
- Loading states
- Error handling
- Refetching on focus

### Step 5: Create Mutation Hooks (`src/api/{feature}/use-*-{feature}.ts`)

Mutation hooks are for **writing** data (create, update, delete). They use `createMutation` from `react-query-kit`.

#### CREATE Hook

```typescript
// src/api/todos/use-create-todo.ts
import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import type { CreateTodoInput, Todo } from '@/lib/todos';
import { addTodo, generateTodoId } from '@/lib/todos';

type CreateTodoContext = {
  previousTodos: Array<Todo> | undefined;
};

export const useCreateTodo = createMutation<Todo, CreateTodoInput>({
  mutationFn: async (input: CreateTodoInput) => {
    const now = new Date().toISOString();
    const newTodo: Todo = {
      id: generateTodoId(),
      title: input.title.trim(),
      description: input.description?.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    return addTodo(newTodo);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
  onMutate: async (input: CreateTodoInput) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<Array<Todo>>(['todos']);

    const now = new Date().toISOString();
    const optimisticTodo: Todo = {
      id: generateTodoId(),
      title: input.title.trim(),
      description: input.description?.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    queryClient.setQueryData<Array<Todo>>(['todos'], (old) => [
      optimisticTodo,
      ...(old ?? []),
    ]);

    return { previousTodos };
  },
  onError: (_error, _variables, context) => {
    if (context?.previousTodos) {
      queryClient.setQueryData(['todos'], context.previousTodos);
    }
  },
});
```

**Key Concepts:**

1. **Type Parameters**: `createMutation<RETURN_TYPE, INPUT_TYPE>`

   - `Todo`: What the mutation returns
   - `CreateTodoInput`: What you pass to `.mutate()`

2. **mutationFn**: The actual operation

   - Creates the todo object
   - Calls storage layer function
   - Returns the created todo

3. **onMutate**: Optimistic update

   - Cancels in-flight queries (prevents race conditions)
   - Saves previous state (for rollback)
   - Updates UI immediately (optimistic update)
   - Returns context (for error handling)

4. **onSuccess**: After successful mutation

   - Invalidates queries to refetch fresh data

5. **onError**: If mutation fails
   - Restores previous state from context
   - UI automatically rolls back

#### UPDATE Hook

```typescript
// src/api/todos/use-update-todo.ts
import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import type { Todo, UpdateTodoInput } from '@/lib/todos';
import { updateTodo } from '@/lib/todos';

type UpdateTodoContext = {
  previousTodos: Array<Todo> | undefined;
};

function buildTodoUpdates(input: UpdateTodoInput): Partial<Todo> {
  const updates: Partial<Todo> = {};

  if (input.title !== undefined) {
    updates.title = input.title.trim();
  }
  if (input.description !== undefined) {
    updates.description = input.description.trim();
  }
  if (input.completed !== undefined) {
    updates.completed = input.completed;
  }

  return updates;
}

export const useUpdateTodo = createMutation<Todo, UpdateTodoInput>({
  mutationFn: async (input: UpdateTodoInput) => {
    const updates = buildTodoUpdates(input);
    return updateTodo(input.id, updates);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
  onMutate: async (input: UpdateTodoInput) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<Array<Todo>>(['todos']);

    queryClient.setQueryData<Array<Todo>>(['todos'], (old) => {
      if (!old) {
        return old;
      }
      return old.map((todo) => {
        if (todo.id === input.id) {
          const updates = buildTodoUpdates(input);
          return {
            ...todo,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return todo;
      });
    });

    return { previousTodos };
  },
  onError: (_error, _variables, context) => {
    if (context?.previousTodos) {
      queryClient.setQueryData(['todos'], context.previousTodos);
    }
  },
});
```

**Note:** The `buildTodoUpdates` helper function prevents code duplication between `mutationFn` and `onMutate`.

#### DELETE Hook

```typescript
// src/api/todos/use-delete-todo.ts
import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import type { Todo } from '@/lib/todos';
import { deleteTodo } from '@/lib/todos';

type DeleteTodoInput = {
  id: string;
};

type DeleteTodoContext = {
  previousTodos: Array<Todo> | undefined;
};

export const useDeleteTodo = createMutation<void, DeleteTodoInput>({
  mutationFn: async (input: DeleteTodoInput) => {
    await deleteTodo(input.id);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
  onMutate: async (input: DeleteTodoInput) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<Array<Todo>>(['todos']);

    queryClient.setQueryData<Array<Todo>>(['todos'], (old) => {
      if (!old) {
        return old;
      }
      return old.filter((todo) => todo.id !== input.id);
    });

    return { previousTodos };
  },
  onError: (_error, _variables, context) => {
    if (context?.previousTodos) {
      queryClient.setQueryData(['todos'], context.previousTodos);
    }
  },
});
```

### Step 6: Export Hooks (`src/api/{feature}/index.ts`)

Create an index file to export all hooks:

```typescript
// src/api/todos/index.ts
export * from './use-todos';
export * from './use-create-todo';
export * from './use-update-todo';
export * from './use-delete-todo';
export * from './use-toggle-todo';
export * from './use-clear-completed';
```

### Step 7: Create UI Components (`src/components/{feature}/`)

Create reusable components following the project conventions:

```typescript
// src/components/todos/todo-form.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { CreateTodoFormData } from '@/lib/todos/validation';
import { createTodoSchema } from '@/lib/todos/validation';

import { Button, ControlledInput, View } from '../ui';

type TodoFormProps = {
  onSubmit: (data: CreateTodoFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateTodoFormData>;
  submitLabel?: string;
};

export function TodoForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitLabel,
}: TodoFormProps) {
  const { t } = useTranslation();

  const { control, handleSubmit, reset } = useForm<CreateTodoFormData>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: defaultValues ?? {
      title: '',
      description: '',
    },
  });

  const onSubmitForm: SubmitHandler<CreateTodoFormData> = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <View className="gap-4">
      <ControlledInput
        control={control}
        name="title"
        label={t('todos.form.titleLabel')}
        placeholder={t('todos.form.titlePlaceholder')}
        autoFocus
      />

      <ControlledInput
        control={control}
        name="description"
        label={t('todos.form.descriptionLabel')}
        placeholder={t('todos.form.descriptionPlaceholder')}
        multiline
        numberOfLines={4}
      />

      <Button
        label={submitLabel ?? t('todos.form.createButton')}
        onPress={handleSubmit(onSubmitForm)}
        loading={isLoading}
      />
    </View>
  );
}
```

### Step 8: Create Screen Component (`src/app/(app)/{feature}.tsx`)

The screen component ties everything together:

```typescript
// src/app/(app)/todos.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';

import {
  useCreateTodo,
  useDeleteTodo,
  useTodos,
  useUpdateTodo,
} from '@/api/todos';
import type { CreateTodoFormData } from '@/lib/todos/validation';

import { Button, Text, View } from '@/components/ui';

export default function TodosScreen() {
  const { t } = useTranslation();
  const { data: todos = [], isLoading } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  // Use useCallback to prevent unnecessary re-renders
  const handleCreateTodo = React.useCallback(
    (data: CreateTodoFormData) => {
      createTodo.mutate(
        { title: data.title, description: data.description },
        {
          onSuccess: () => {
            showMessage({
              message: t('todos.messages.created'),
              type: 'success',
            });
          },
          onError: () => {
            showMessage({
              message: t('todos.messages.createError'),
              type: 'danger',
            });
          },
        },
      );
    },
    [createTodo, t],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Text className="mb-4 text-2xl font-bold">My Todos</Text>

      {/* Your UI components here */}
    </View>
  );
}
```

**Important:** All hooks must be called **before** any conditional returns. This is a React rule.

## Key Patterns and Best Practices

### 1. Error Handling Strategy

**READ operations**: Return safe defaults

```typescript
export function getTodos(): Array<Todo> {
  try {
    // ... fetch logic
  } catch (error) {
    console.error('Error:', error);
    return []; // Don't throw
  }
}
```

**WRITE operations**: Throw errors

```typescript
export async function addTodo(todo: Todo): Promise<Todo> {
  try {
    // ... save logic
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to add todo'); // Throw
  }
}
```

### 2. Optimistic Updates

All mutations implement optimistic updates for instant UI feedback:

1. **onMutate**: Update UI immediately
2. **mutationFn**: Perform actual operation
3. **onSuccess**: Confirm update (or refetch)
4. **onError**: Rollback to previous state

### 3. Type Safety

- Use `z.infer<typeof schema>` to generate types from Zod schemas
- Avoid type assertions (`as`) unless absolutely necessary
- Use explicit return types for all functions

### 4. Code Organization

```
src/
├── lib/{feature}/
│   ├── types.ts          # Type definitions
│   ├── validation.ts     # Zod schemas
│   ├── storage.ts        # Storage functions
│   └── index.ts          # Public exports
│
├── api/{feature}/
│   ├── use-{feature}.ts      # Query hook
│   ├── use-create-{feature}.ts
│   ├── use-update-{feature}.ts
│   ├── use-delete-{feature}.ts
│   └── index.ts              # Public exports
│
└── components/{feature}/
    ├── {feature}-form.tsx
    ├── {feature}-list.tsx
    └── {feature}-item.tsx
```

### 5. React Hooks Rules

- **Always call hooks at the top level** (before any conditional returns)
- **Use `useCallback`** for handlers passed to child components
- **Use `useMemo`** for expensive computations

## Complete Example: Notes Feature

Here's a complete example implementing a Notes feature following this pattern:

### 1. Types (`src/lib/notes/types.ts`)

```typescript
export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type CreateNoteInput = {
  title: string;
  content: string;
};
```

### 2. Validation (`src/lib/notes/validation.ts`)

```typescript
import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(5000),
});

export type CreateNoteFormData = z.infer<typeof createNoteSchema>;
```

### 3. Storage (`src/lib/notes/storage.ts`)

```typescript
import { getItem, setItem } from '@/lib/storage';
import type { Note } from './types';

const NOTES_STORAGE_KEY = 'notes';

export function getNotes(): Array<Note> {
  try {
    const notes = getItem<Array<Note>>(NOTES_STORAGE_KEY);
    return notes?.filter((note) => !note.deletedAt) ?? [];
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
}

export async function addNote(note: Note): Promise<Note> {
  try {
    const notes = getItem<Array<Note>>(NOTES_STORAGE_KEY) ?? [];
    await setItem(NOTES_STORAGE_KEY, [...notes, note]);
    return note;
  } catch (error) {
    console.error('Error adding note:', error);
    throw new Error('Failed to add note');
  }
}
```

### 4. Query Hook (`src/api/notes/use-notes.ts`)

```typescript
import { createQuery } from 'react-query-kit';
import { getNotes } from '@/lib/notes/storage';
import type { Note } from '@/lib/notes/types';

export const useNotes = createQuery<Array<Note>>({
  queryKey: ['notes'],
  fetcher: async () => getNotes(),
});
```

### 5. Mutation Hook (`src/api/notes/use-create-note.ts`)

```typescript
import { createMutation } from 'react-query-kit';
import { queryClient } from '@/api/common';
import type { CreateNoteInput, Note } from '@/lib/notes/types';
import { addNote, generateNoteId } from '@/lib/notes';

export const useCreateNote = createMutation<Note, CreateNoteInput>({
  mutationFn: async (input: CreateNoteInput) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: generateNoteId(),
      title: input.title.trim(),
      content: input.content.trim(),
      createdAt: now,
      updatedAt: now,
    };
    return addNote(newNote);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  },
  onMutate: async (input: CreateNoteInput) => {
    await queryClient.cancelQueries({ queryKey: ['notes'] });
    const previousNotes = queryClient.getQueryData<Array<Note>>(['notes']);

    const optimisticNote: Note = {
      id: generateNoteId(),
      title: input.title.trim(),
      content: input.content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    queryClient.setQueryData<Array<Note>>(['notes'], (old) => [
      optimisticNote,
      ...(old ?? []),
    ]);

    return { previousNotes };
  },
  onError: (_error, _variables, context) => {
    if (context?.previousNotes) {
      queryClient.setQueryData(['notes'], context.previousNotes);
    }
  },
});
```

## Common Pitfalls

### 1. Calling Hooks Conditionally

❌ **Wrong:**

```typescript
if (isLoading) {
  return <View>Loading</View>;
}
const handleCreate = useCallback(...); // Hook called conditionally!
```

✅ **Correct:**

```typescript
const handleCreate = useCallback(...); // Hook at top level
if (isLoading) {
  return <View>Loading</View>;
}
```

### 2. Forgetting useCallback

❌ **Wrong:**

```typescript
const handleCreate = (data) => {
  createTodo.mutate(data);
};
```

✅ **Correct:**

```typescript
const handleCreate = React.useCallback(
  (data) => {
    createTodo.mutate(data);
  },
  [createTodo],
);
```

### 3. Not Using Type Inference

❌ **Wrong:**

```typescript
const context = context as CreateTodoContext | undefined;
```

✅ **Correct:**

```typescript
if (context?.previousTodos) {
  // TypeScript infers the type
}
```

## Testing

Each layer can be tested independently:

- **Storage Layer**: Test pure functions with mock storage
- **API Layer**: Test hooks with React Query testing utilities
- **UI Layer**: Test components with React Native Testing Library

See the [Testing Guide](/testing/overview/) for more details.

## Next Steps

- Review the [Todo App Guide](/guides/todos/) for a complete implementation example
- Check the [Data Fetching Guide](/guides/data-fetching/) for React Query patterns
- Read the [Storage Guide](/guides/storage/) for MMKV details

## Summary

Implementing CRUD operations follows this pattern:

1. **Define types** → Create TypeScript types
2. **Create validation** → Use Zod schemas
3. **Implement storage** → Pure functions for persistence
4. **Create query hook** → For reading data
5. **Create mutation hooks** → For writing data (with optimistic updates)
6. **Build UI components** → Reusable form/list components
7. **Create screen** → Tie everything together

This architecture provides a solid foundation that's easy to test, maintain, and extend to sync with remote databases in the future.
