import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import type { Todo, UpdateTodoInput } from '@/lib/todos';
import { updateTodo } from '@/lib/todos';

type UpdateTodoContext = {
  previousTodos: Array<Todo> | undefined;
};

export const useUpdateTodo = createMutation<Todo, UpdateTodoInput>({
  mutationFn: async (input: UpdateTodoInput) => {
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
