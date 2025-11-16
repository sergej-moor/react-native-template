import { createMutation } from 'react-query-kit';

import { addNotes } from '@/lib/notes/storage';
import { type CreateNoteInput, type Note } from '@/lib/notes/types';
import { generateNoteId } from '@/lib/notes/utils';

import { queryClient } from '../common';

type CreateNoteContext = {
  previousNotes: Array<Note> | undefined;
};

export const useCreateNote = createMutation<Note, CreateNoteInput>({
  mutationFn: async (input: CreateNoteInput) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: generateNoteId(),
      title: input.title.trim(),
      content: input.content.trim(),
      createdAt: now,
      updatedAt: now,
    };

    return addNotes(newNote);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  },
  onMutate: async (input: CreateNoteInput) => {
    await queryClient.cancelQueries({ queryKey: ['notes'] });

    const previousNotes = queryClient.getQueryData<Array<Note>>(['notes']);

    const now = new Date().toISOString();
    const optimisticNote: Note = {
      id: generateNoteId(),
      title: input.title.trim(),
      content: input.content.trim(),
      createdAt: now,
      updatedAt: now,
    };
    queryClient.setQueryData<Array<Note>>(['notes'], (old) => [
      optimisticNote,
      ...(old ?? []),
    ]);
    return { previousNotes };
  },
  onError: (_error, _variables, context) => {
    const typedContext = context as CreateNoteContext | undefined;
    if (typedContext?.previousNotes) {
      queryClient.setQueryData(['notes'], typedContext.previousNotes);
    }
  },
});
