import { createQuery } from 'react-query-kit';

import { getNotes } from '@/lib/notes/storage';
import type { Note } from '@/lib/notes/types';

export const useNotes = createQuery<Array<Note>>({
  queryKey: ['notes'],
  fetcher: async () => getNotes(),
});
