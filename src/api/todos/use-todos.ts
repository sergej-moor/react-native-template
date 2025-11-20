import { createQuery } from 'react-query-kit';

import { supabase } from '@/lib/supabase';
import type { DBTodo, Todo } from '@/lib/todos/types';

export const useTodos = createQuery<Array<Todo>>({
  queryKey: ['todos'],
  fetcher: async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .is('deleted_at', null) // Only fetch non-deleted
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map snake_case DB type to camelCase frontend type
    return (data as Array<DBTodo>).map((todo) => ({
      id: todo.id,
      title: todo.title,
      description: todo.description ?? undefined,
      completed: todo.completed,
      createdAt: todo.created_at,
      updatedAt: todo.updated_at,
      userId: todo.user_id,
    }));
  },
});
