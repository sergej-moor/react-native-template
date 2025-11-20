import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import { supabase } from '@/lib/supabase';
import type { DBTodo, Todo, UpdateTodoInput } from '@/lib/todos';

type UpdateTodoContext = {
  previousTodos: Array<Todo> | undefined;
};

export const useUpdateTodo = createMutation<Todo, UpdateTodoInput>({
  mutationFn: async (input: UpdateTodoInput) => {
    const updates: Partial<DBTodo> = {};

    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.description !== undefined) {
      updates.description = input.description.trim() || null;
    }
    if (input.completed !== undefined) {
      updates.completed = input.completed;
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const dbTodo = data as DBTodo;
    return {
      id: dbTodo.id,
      title: dbTodo.title,
      description: dbTodo.description ?? undefined,
      completed: dbTodo.completed,
      createdAt: dbTodo.created_at,
      updatedAt: dbTodo.updated_at,
      userId: dbTodo.user_id,
    };
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
    const typedContext = context as UpdateTodoContext | undefined;
    if (typedContext?.previousTodos) {
      queryClient.setQueryData(['todos'], typedContext.previousTodos);
    }
  },
});
