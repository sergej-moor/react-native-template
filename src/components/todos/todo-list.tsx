import { FlashList } from '@shopify/flash-list';
import React from 'react';

import type { Todo } from '@/lib/todos';

import { EmptyState } from './empty-state';
import { TodoItem } from './todo-item';

type TodoListProps = {
  todos: Array<Todo>;
  filter: 'all' | 'active' | 'completed';
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (todo: Todo) => void;
  onPress?: (id: string) => void;
};

export const TodoList = React.memo(
  ({ todos, filter, onToggle, onDelete, onEdit, onPress }: TodoListProps) => {
    const renderItem = React.useCallback(
      ({ item }: { item: Todo }) => (
        <TodoItem
          todo={item}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onPress={onPress}
        />
      ),
      [onToggle, onDelete, onEdit, onPress],
    );

    const keyExtractor = React.useCallback((item: Todo) => item.id, []);

    if (todos.length === 0) {
      return <EmptyState filter={filter} />;
    }

    return (
      <FlashList
        data={todos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 100,
          paddingHorizontal: 12,
        }}
      />
    );
  },
);

TodoList.displayName = 'TodoList';
