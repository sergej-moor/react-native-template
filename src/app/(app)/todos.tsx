/* eslint-disable max-lines-per-function */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';

import {
  useClearCompleted,
  useCreateTodo,
  useDeleteTodo,
  useTodos,
  useToggleTodo,
} from '@/api/todos';
import {
  EmptyState,
  TodoFiltersComponent,
  TodoForm,
  TodoHeader,
  TodoList,
} from '@/components/todos';
import type { TodoFilters } from '@/lib/todos';
import { filterTodos, getTodoStats } from '@/lib/todos';
import type { CreateTodoFormData } from '@/lib/todos/validation';

import { FocusAwareStatusBar, ScrollView, View } from '../../components/ui';

export default function TodosScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<TodoFilters>('all');

  const { data: allTodos = [], isLoading } = useTodos();
  const createTodo = useCreateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const clearCompleted = useClearCompleted();

  const filteredTodos = React.useMemo(
    () => filterTodos(allTodos, filter),
    [allTodos, filter],
  );

  const stats = React.useMemo(() => {
    const todoStats = getTodoStats(allTodos);
    return {
      all: todoStats.total,
      active: todoStats.active,
      completed: todoStats.completed,
    };
  }, [allTodos]);

  const handleCreateTodo = React.useCallback(
    (data: CreateTodoFormData) => {
      createTodo.mutate(data, {
        onSuccess: () => {
          showMessage({
            message: t('todos.messages.created'),
            type: 'success',
          });
        },
        onError: () => {
          showMessage({
            message: t('todos.messages.createError'),
            type: 'danger',
          });
        },
      });
    },
    [createTodo, t],
  );

  const handleToggleTodo = React.useCallback(
    (id: string, completed: boolean) => {
      toggleTodo.mutate(
        { id, completed },
        {
          onError: () => {
            showMessage({
              message: t('todos.messages.toggleError'),
              type: 'danger',
            });
          },
        },
      );
    },
    [toggleTodo, t],
  );

  const handleDeleteTodo = React.useCallback(
    (id: string) => {
      deleteTodo.mutate(
        { id },
        {
          onSuccess: () => {
            showMessage({
              message: t('todos.messages.deleted'),
              type: 'success',
            });
          },
          onError: () => {
            showMessage({
              message: t('todos.messages.deleteError'),
              type: 'danger',
            });
          },
        },
      );
    },
    [deleteTodo, t],
  );

  const handleClearCompleted = React.useCallback(() => {
    clearCompleted.mutate(undefined, {
      onSuccess: () => {
        showMessage({
          message: t('todos.messages.clearedCompleted'),
          type: 'success',
        });
      },
      onError: () => {
        showMessage({
          message: t('todos.messages.clearError'),
          type: 'danger',
        });
      },
    });
  }, [clearCompleted, t]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <FocusAwareStatusBar />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <FocusAwareStatusBar />

      <View className="flex-1">
        <ScrollView>
          <View className="gap-6 px-4 pb-4 pt-8">
            <TodoHeader
              completedCount={stats.completed}
              onClearCompleted={handleClearCompleted}
              isClearing={clearCompleted.isPending}
            />

            <TodoForm
              onSubmit={handleCreateTodo}
              isLoading={createTodo.isPending}
            />

            <TodoFiltersComponent
              activeFilter={filter}
              onFilterChange={setFilter}
              stats={stats}
            />
          </View>
        </ScrollView>

        {filteredTodos.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <TodoList
            todos={filteredTodos}
            filter={filter}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
          />
        )}
      </View>
    </View>
  );
}
