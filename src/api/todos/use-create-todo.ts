import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import { useAuth } from '@/lib';
import { supabase } from '@/lib/supabase';
import type { CreateTodoInput, DBTodo, Todo } from '@/lib/todos';
import { generateTodoId } from '@/lib/todos';

type CreateTodoContext = {
  previousTodos: Array<Todo> | undefined;
};

export const useCreateTodo = createMutation<Todo, CreateTodoInput>({
  mutationFn: async (input: CreateTodoInput) => {
    const user = useAuth.getState().user;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('todos')
      .insert({
        title: input.title.trim(),
        description: input.description?.trim() ?? null,
        completed: false,
        user_id: user.id, // Explicitly set user_id to ensure Guest/Auth works identically
      })
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
  onMutate: async (input: CreateTodoInput) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<Array<Todo>>(['todos']);
    const user = useAuth.getState().user;

    const now = new Date().toISOString();
    // Optimistic update with a fake ID
    const optimisticTodo: Todo = {
      id: generateTodoId(),
      title: input.title.trim(),
      description: input.description?.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
      userId: user?.id ?? 'me', // Use real ID if available, else 'me'
    };

    queryClient.setQueryData<Array<Todo>>(['todos'], (old) => [
      optimisticTodo,
      ...(old ?? []),
    ]);

    return { previousTodos };
  },
  onError: (_error, _variables, context) => {
    const typedContext = context as CreateTodoContext | undefined;
    if (typedContext?.previousTodos) {
      queryClient.setQueryData(['todos'], typedContext.previousTodos);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
