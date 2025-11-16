import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import type { Todo } from '@/lib/todos';
import { deleteTodo, restoreTodo } from '@/lib/todos';

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
    const typedContext = context as DeleteTodoContext | undefined;
    if (typedContext?.previousTodos) {
      queryClient.setQueryData(['todos'], typedContext.previousTodos);
    }
  },
});

export const useRestoreTodo = createMutation<Todo, DeleteTodoInput>({
  mutationFn: async (input: DeleteTodoInput) => restoreTodo(input.id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
