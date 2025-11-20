import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import { supabase } from '@/lib/supabase';
import type { Todo } from '@/lib/todos';

type DeleteTodoInput = {
  id: string;
};

type DeleteTodoContext = {
  previousTodos: Array<Todo> | undefined;
};

export const useDeleteTodo = createMutation<void, DeleteTodoInput>({
  mutationFn: async (input: DeleteTodoInput) => {
    const { error } = await supabase
      .from('todos')
      .update({ deleted_at: new Date().toISOString() }) // Soft delete
      .eq('id', input.id);

    if (error) {
      throw error;
    }
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
    const typedContext = context as DeleteTodoContext | undefined;
    if (typedContext?.previousTodos) {
      queryClient.setQueryData(['todos'], typedContext.previousTodos);
    }
  },
});

// Restore not needed for standard UI, but if we implement trash bin later:
export const useRestoreTodo = createMutation<void, DeleteTodoInput>({
  mutationFn: async (input: DeleteTodoInput) => {
    const { error } = await supabase
      .from('todos')
      .update({ deleted_at: null })
      .eq('id', input.id);

    if (error) {
      throw error;
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
