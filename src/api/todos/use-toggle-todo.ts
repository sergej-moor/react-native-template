import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import { supabase } from '@/lib/supabase';
import type { DBTodo, Todo } from '@/lib/todos';

type ToggleTodoInput = {
  id: string;
  completed: boolean;
};

type ToggleTodoContext = {
  previousTodos: Array<Todo> | undefined;
};

export const useToggleTodo = createMutation<Todo, ToggleTodoInput>({
  mutationFn: async (input: ToggleTodoInput) => {
    const { data, error } = await supabase
      .from('todos')
      .update({ completed: input.completed })
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
  onMutate: async (input: ToggleTodoInput) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<Array<Todo>>(['todos']);

    queryClient.setQueryData<Array<Todo>>(['todos'], (old) => {
      if (!old) {
        return old;
      }
      return old.map((todo) =>
        todo.id === input.id
          ? {
              ...todo,
              completed: input.completed,
              updatedAt: new Date().toISOString(),
            }
          : todo,
      );
    });

    return { previousTodos };
  },
  onError: (_error, _variables, context) => {
    const typedContext = context as ToggleTodoContext | undefined;
    if (typedContext?.previousTodos) {
      queryClient.setQueryData(['todos'], typedContext.previousTodos);
    }
  },
});
