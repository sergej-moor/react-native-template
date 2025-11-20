---
title: CRUD Operations Guide
description: A step-by-step guide to implementing CRUD operations using Supabase and React Query.
---

This guide explains how to implement CRUD (Create, Read, Update, Delete) operations in this React Native template, moving from local storage to a **Cloud-First, Offline-Capable** architecture using Supabase.

## Overview

The architecture consists of:

1.  **Backend**: Supabase (PostgreSQL + RLS).
2.  **API Layer**: React Query hooks (`src/api/`) handling data fetching, caching, and optimistic updates.
3.  **UI Layer**: Components (`src/components/`) triggering these hooks.

## Step-by-Step Implementation

### Step 1: Define Types (`src/lib/{feature}/types.ts`)

We define both the **Frontend Type** (CamelCase) and the **Database Type** (snake_case) to handle the mismatch cleanly.

```typescript
// src/lib/todos/types.ts

// Frontend Type
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: string;
};

// Database Type (Supabase)
export type DBTodo = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
```

### Step 2: Create Query Hook (`src/api/{feature}/use-{feature}.ts`)

Query hooks fetch data. We use `offlineFirst` network mode so users can see cached data when offline.

```typescript
import { createQuery } from 'react-query-kit';
import { supabase } from '@/lib/supabase';

export const useTodos = createQuery<Array<Todo>>({
  queryKey: ['todos'],
  fetcher: async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .is('deleted_at', null) // Filter soft-deleted items
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map DB types to Frontend types
    return (data as DBTodo[]).map((todo) => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      userId: todo.user_id,
      createdAt: todo.created_at,
      // ...
    }));
  },
});
```

### Step 3: Create Mutation Hooks with Optimistic Updates

We use `createMutation` to handle writes. The key is implementing `onMutate` to update the UI _before_ the network request completes.

#### Example: Update Hook

```typescript
import { createMutation } from 'react-query-kit';
import { queryClient } from '@/api/common';
import { supabase } from '@/lib/supabase';

export const useUpdateTodo = createMutation<Todo, UpdateTodoInput>({
  mutationFn: async (input) => {
    const { data, error } = await supabase
      .from('todos')
      .update({ title: input.title, completed: input.completed })
      .eq('id', input.id)
      .select()
      .single();

    if (error) throw error;
    return mapToTodo(data);
  },
  // Optimistic Update
  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    const previousTodos = queryClient.getQueryData<Array<Todo>>(['todos']);

    queryClient.setQueryData<Array<Todo>>(['todos'], (old) => {
      return old?.map((todo) =>
        todo.id === input.id
          ? { ...todo, ...input, updatedAt: new Date().toISOString() }
          : todo,
      );
    });

    return { previousTodos };
  },
  // Rollback on Error
  onError: (err, vars, context) => {
    if (context?.previousTodos) {
      queryClient.setQueryData(['todos'], context.previousTodos);
    }
  },
  // Refetch on Settle (Success or Error)
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

### Step 4: Handling Offline Mutations

In `src/api/common/api-provider.tsx`, we configured React Query with `NetInfo`.

- When **Online**: Mutations run immediately.
- When **Offline**: Mutations are **Paused** (queued). `onMutate` still runs, so the user sees the update. The network request waits until connection is restored.

### Step 5: UI Component

The UI component remains simple and agnostic to the backend logic.

```typescript
export function TodoItem({ todo }: { todo: Todo }) {
  const toggleTodo = useToggleTodo();

  return (
    <Checkbox
      checked={todo.completed}
      onPress={() => {
        toggleTodo.mutate({
          id: todo.id,
          completed: !todo.completed
        });
      }}
    />
  );
}
```

## Summary of Changes (Local vs Cloud)

| Feature     | Previous (Local/MMKV) | New (Cloud/Supabase)        |
| :---------- | :-------------------- | :-------------------------- |
| **Storage** | MMKV (Device only)    | PostgreSQL (Cloud)          |
| **Sync**    | None                  | Real-time / Background Sync |
| **Offline** | Native                | React Query Cache + Queue   |
| **Auth**    | None (Global)         | Row Level Security (RLS)    |
| **IDs**     | UUID (Client gen)     | UUID (Server gen fallback)  |

This architecture allows your app to scale from a simple local tool to a collaborative, multi-device platform without rewriting the UI layer.
