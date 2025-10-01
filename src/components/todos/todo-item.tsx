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
  ({ todo, onToggle, onDelete }: TodoItemProps) => {
    const handleToggle = React.useCallback(() => {
      onToggle(todo.id, !todo.completed);
    }, [todo.id, todo.completed, onToggle]);

    const handleDelete = React.useCallback(() => {
      onDelete(todo.id);
    }, [todo.id, onDelete]);

    return (
      <Pressable
        onPress={handleToggle}
        className="mb-2  flex-row items-center gap-2 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm active:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:active:bg-neutral-800"
      >
        <View className="p-2">
          <Checkbox
            checked={todo.completed}
            onChange={handleToggle}
            accessibilityLabel={
              todo.completed ? 'Mark as incomplete' : 'Mark as complete'
            }
          />
        </View>

        <View className="flex-1">
          <Text
            className={`text-lg font-medium ${
              todo.completed
                ? 'text-neutral-500 line-through dark:text-neutral-400'
                : 'text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {todo.title}
          </Text>

          {todo.description && (
            <Text
              className={`mt-2 text-base leading-6 ${
                todo.completed
                  ? 'text-neutral-400 line-through dark:text-neutral-500'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {todo.description}
            </Text>
          )}
        </View>

        <Pressable
          onPress={handleDelete}
          className="p-2"
          accessibilityLabel="Delete todo"
          accessibilityRole="button"
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              stroke="#ef4444"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </Pressable>
    );
  },
);

TodoItem.displayName = 'TodoItem';
