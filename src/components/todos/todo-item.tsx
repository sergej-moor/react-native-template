import React from 'react';
import { Pressable } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

import type { Todo } from '@/lib/todos';

import { Checkbox, Text, View } from '../ui';

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (todo: Todo) => void;
  onPress?: (id: string) => void;
};

const EditAction = () => (
  <View className="mb-2 justify-center">
    <View className="h-full items-center justify-center rounded-r-xl bg-blue-500 px-6 dark:bg-blue-600">
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
          stroke="#ffffff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
          stroke="#ffffff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  </View>
);

const DeleteAction = () => (
  <View className="mb-2 justify-center">
    <View className="h-full items-center justify-center rounded-l-xl bg-red-500 px-6 dark:bg-red-600">
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          stroke="#ffffff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  </View>
);

export const TodoItem = React.memo(
  ({ todo, onToggle, onDelete, onEdit }: TodoItemProps) => {
    const swipeableRef = React.useRef<Swipeable>(null);

    const handleToggle = React.useCallback(() => {
      onToggle(todo.id, !todo.completed);
    }, [todo.id, todo.completed, onToggle]);

    const handleDelete = React.useCallback(() => {
      onDelete(todo.id);
    }, [todo.id, onDelete]);

    const handleEdit = React.useCallback(() => {
      swipeableRef.current?.close();
      onEdit?.(todo);
    }, [todo, onEdit]);

    return (
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={onEdit ? () => <EditAction /> : undefined}
        renderRightActions={() => <DeleteAction />}
        overshootLeft={false}
        overshootRight={false}
        leftThreshold={40}
        rightThreshold={40}
        onSwipeableLeftOpen={handleEdit}
        onSwipeableRightOpen={handleDelete}
      >
        <Pressable
          onPress={handleToggle}
          className="mb-2 flex-row items-center gap-2 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm active:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:active:bg-neutral-800"
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
        </Pressable>
      </Swipeable>
    );
  },
);

TodoItem.displayName = 'TodoItem';
