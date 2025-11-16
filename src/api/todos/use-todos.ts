import { createQuery } from 'react-query-kit';

import type { Todo } from '@/lib/todos';
import { getTodos } from '@/lib/todos';

export const useTodos = createQuery<Array<Todo>>({
  queryKey: ['todos'],
  fetcher: async () => getTodos(),
});
