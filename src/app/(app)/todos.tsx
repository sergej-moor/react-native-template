/* eslint-disable max-lines-per-function */
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import Svg, { Path } from 'react-native-svg';

import {
  useClearCompleted,
  useCreateTodo,
  useDeleteTodo,
  useTodos,
  useToggleTodo,
  useUpdateTodo,
} from '@/api/todos';
import {
  TodoFiltersComponent,
  TodoForm,
  TodoHeader,
  TodoList,
} from '@/components/todos';
import type { Todo, TodoFilters } from '@/lib/todos';
import { filterTodos, getTodoStats } from '@/lib/todos';
import type { CreateTodoFormData } from '@/lib/todos/validation';

import {
  FocusAwareStatusBar,
  Modal,
  Text,
  useModal,
  View,
} from '../../components/ui';
import BottomSheetKeyboardAwareScrollView from '../../components/ui/modal-keyboard-aware-scroll-view';

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

export default function TodosScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<TodoFilters>('all');
  const [selectedTodo, setSelectedTodo] = React.useState<Todo | null>(null);
  const {
    ref: addModalRef,
    present: presentAdd,
    dismiss: dismissAdd,
  } = useModal();
  const {
    ref: editModalRef,
    present: presentEdit,
    dismiss: dismissEdit,
  } = useModal();

  const { data: allTodos = [], isLoading } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const clearCompleted = useClearCompleted();

  const filteredTodos = React.useMemo(
    () => filterTodos(allTodos, filter),
    [allTodos, filter],
  );

  const stats = React.useMemo(() => getTodoStats(allTodos), [allTodos]);

  const handleCreateTodo = React.useCallback(
    (data: CreateTodoFormData) => {
      createTodo.mutate(
        { title: data.title, description: data.description },
        {
          onSuccess: () => {
            showMessage({
              message: t('todos.messages.created'),
              type: 'success',
            });
            dismissAdd();
          },
          onError: () => {
            showMessage({
              message: t('todos.messages.createError'),
              type: 'danger',
            });
          },
        },
      );
    },
    [createTodo, t, dismissAdd],
  );

  const handleEditTodoPress = React.useCallback(
    (todo: Todo) => {
      setSelectedTodo(todo);
      presentEdit();
    },
    [presentEdit],
  );

  const handleUpdateTodo = React.useCallback(
    (data: CreateTodoFormData) => {
      if (!selectedTodo) {
        return;
      }

      updateTodo.mutate(
        {
          id: selectedTodo.id,
          title: data.title,
          description: data.description,
        },
        {
          onSuccess: () => {
            showMessage({
              message: t('todos.messages.updated'),
              type: 'success',
            });
            dismissEdit();
            setSelectedTodo(null);
          },
          onError: () => {
            showMessage({
              message: t('todos.messages.updateError'),
              type: 'danger',
            });
          },
        },
      );
    },
    [updateTodo, selectedTodo, t, dismissEdit],
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
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <FocusAwareStatusBar />

      {/* Header with filters and actions */}
      <View className="border-b border-neutral-200 p-4 dark:border-neutral-800">
        <View className="mb-3">
          <TodoHeader
            totalCount={stats.total}
            completedCount={stats.completed}
            onClearCompleted={handleClearCompleted}
            isClearing={clearCompleted.isPending}
          />
        </View>
        <TodoFiltersComponent
          activeFilter={filter}
          onFilterChange={setFilter}
        />
      </View>

      {/* Todo List */}
      <View className="flex-1">
        <TodoList
          todos={filteredTodos}
          filter={filter}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
          onEdit={handleEditTodoPress}
          onPress={() => {}}
        />
      </View>

      {/* Floating Action Button */}
      <View className="absolute bottom-6 right-6">
        <Pressable
          onPress={() => presentAdd()}
          className="size-14 items-center justify-center rounded-full bg-blue-600 shadow-lg active:bg-blue-700 dark:bg-blue-500 dark:active:bg-blue-600"
          accessibilityLabel={t('todos.addTodo')}
          accessibilityRole="button"
        >
          <PlusIcon color="#fff" />
        </Pressable>
      </View>

      {/* Add Todo Modal */}
      <Modal
        ref={addModalRef as React.RefObject<BottomSheetModal>}
        title={t('todos.addTodo')}
        snapPoints={['50%']}
      >
        <BottomSheetKeyboardAwareScrollView
          contentContainerClassName="px-4 pb-8"
          bottomOffset={8}
        >
          <TodoForm
            onSubmit={handleCreateTodo}
            isLoading={createTodo.isPending}
            submitLabel={t('todos.form.createButton')}
          />
        </BottomSheetKeyboardAwareScrollView>
      </Modal>

      {/* Edit Todo Modal */}
      <Modal
        ref={editModalRef as React.RefObject<BottomSheetModal>}
        title={t('todos.editTodo')}
        snapPoints={['50%']}
      >
        <BottomSheetKeyboardAwareScrollView
          contentContainerClassName="px-4 pb-8"
          bottomOffset={8}
        >
          {selectedTodo && (
            <TodoForm
              onSubmit={handleUpdateTodo}
              isLoading={updateTodo.isPending}
              defaultValues={{
                title: selectedTodo.title,
                description: selectedTodo.description ?? '',
              }}
              submitLabel={t('todos.form.updateButton')}
            />
          )}
        </BottomSheetKeyboardAwareScrollView>
      </Modal>
    </View>
  );
}
