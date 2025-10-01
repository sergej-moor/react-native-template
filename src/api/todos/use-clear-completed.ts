import { createMutation } from 'react-query-kit';

import { queryClient } from '@/api/common';
import type { Todo } from '@/lib/todos';
import { clearCompletedTodos } from '@/lib/todos';

type ClearCompletedContext = {
  previousTodos: Array<Todo> | undefined;
};

export const useClearCompleted = createMutation<void, void>({
  mutationFn: async () => {
    await clearCompletedTodos();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
  onMutate: async () => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<Array<Todo>>(['todos']);

    queryClient.setQueryData<Array<Todo>>(['todos'], (old) => {
      if (!old) {
        return old;
      }
      return old.filter((todo) => !todo.completed);
    });

    return { previousTodos };
  },
  onError: (_error, _variables, context) => {
    const typedContext = context as ClearCompletedContext | undefined;
    if (typedContext?.previousTodos) {
      queryClient.setQueryData(['todos'], typedContext.previousTodos);
    }
  },
});
