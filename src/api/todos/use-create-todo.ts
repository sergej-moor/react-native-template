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
    const typedContext = context as CreateTodoContext | undefined;
    if (typedContext?.previousTodos) {
      queryClient.setQueryData(['todos'], typedContext.previousTodos);
    }
  },
});
