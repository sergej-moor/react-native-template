import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import type { Todo } from '@/lib/todos';
import { updateTodo } from '@/lib/todos';

type ToggleTodoInput = {
  id: string;
  completed: boolean;
};

type ToggleTodoContext = {
  previousTodos: Array<Todo> | undefined;
};

export const useToggleTodo = createMutation<Todo, ToggleTodoInput>({
  mutationFn: async (input: ToggleTodoInput) =>
    updateTodo(input.id, { completed: input.completed }),
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
