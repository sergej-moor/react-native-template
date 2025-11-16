import React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import Svg, { Path } from 'react-native-svg';

import { useCreateNote, useNotes } from '@/api/notes';
import { type CreateNoteFormData } from '@/lib/notes/validation';

import { Pressable, Text, View } from '../../components/ui';

export default function NotesScreen() {
  const { data: notes = [], isLoading } = useNotes();
  const createNote = useCreateNote();
  const { t } = useTranslation();

  const handleCreateNote = React.useCallback(
    (data: CreateNoteFormData) => {
      createNote.mutate(
        { title: data.title, content: data.content },
        {
          onSuccess: () => {
            showMessage({
              message: t('sda'),
              type: 'success',
            });
          },
          onError: () => {
            showMessage({
              message: t('sad'),
              type: 'danger',
            });
          },
        },
      );
    },
    [createNote, t],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading</Text>
      </View>
    );
  }

  const PlusIcon = ({ color = '#fff' }: { color?: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <View className="flex-1 p-4">
      <Pressable
        onPress={() =>
          handleCreateNote({ title: 'testtitle', content: 'testcontent' })
        }
        className="size-14 items-center justify-center rounded-full bg-blue-600 shadow-lg active:bg-blue-700 dark:bg-blue-500 dark:active:bg-blue-600"
      >
        <PlusIcon color="#fff" />
      </Pressable>
      <Text className="mb-4 text-2xl font-bold">My Notes</Text>
      {notes.length === 0 ? (
        <Text>No notes yet</Text>
      ) : (
        notes.map((note) => (
          <View key={note.id} className="mb-4 rounded bg-gray-100 p-4">
            <Text className="font-bold">{note.title}</Text>
            <Text>{note.content}</Text>
          </View>
        ))
      )}
    </View>
  );
}
