import React from 'react';
import { Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { Todo } from '@/lib/todos';

import { Checkbox, Text, View } from '../ui';

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onPress?: (id: string) => void;
};

export const TodoItem = React.memo(
  ({ todo, onToggle, onDelete, onPress }: TodoItemProps) => {
    const handleToggle = React.useCallback(() => {
      onToggle(todo.id, !todo.completed);
    }, [todo.id, todo.completed, onToggle]);

    const handleDelete = React.useCallback(() => {
      onDelete(todo.id);
    }, [todo.id, onDelete]);

    const handlePress = React.useCallback(() => {
      onPress?.(todo.id);
    }, [todo.id, onPress]);

    return (
      <View className="flex-row items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Checkbox
          checked={todo.completed}
          onChange={handleToggle}
          accessibilityLabel={
            todo.completed ? 'Mark as incomplete' : 'Mark as complete'
          }
        />

        <Pressable className="flex-1" onPress={handlePress}>
          <Text
            className={`text-base ${
              todo.completed
                ? 'text-neutral-500 line-through dark:text-neutral-400'
                : 'text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {todo.title}
          </Text>

          {todo.description && (
            <Text
              className={`mt-1 text-sm ${
                todo.completed
                  ? 'text-neutral-400 line-through dark:text-neutral-500'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
              numberOfLines={2}
            >
              {todo.description}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleDelete}
          className="p-2"
          accessibilityLabel="Delete todo"
          accessibilityRole="button"
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              stroke="#ef4444"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </View>
    );
  },
);

TodoItem.displayName = 'TodoItem';
