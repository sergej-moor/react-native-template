import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import type { TodoFilters } from '@/lib/todos';

import { Text, View } from '../ui';

type TodoFiltersProps = {
  activeFilter: TodoFilters;
  onFilterChange: (filter: TodoFilters) => void;
};

export function TodoFiltersComponent({
  activeFilter,
  onFilterChange,
}: TodoFiltersProps) {
  const { t } = useTranslation();

  const filters: Array<{ key: TodoFilters; label: string }> = [
    { key: 'all', label: t('todos.filters.all') },
    { key: 'active', label: t('todos.filters.active') },
    { key: 'completed', label: t('todos.filters.completed') },
  ];

  return (
    <View className="flex-row gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            className={`flex-1 rounded-md px-3 py-2 ${
              isActive
                ? 'bg-white shadow-sm dark:bg-neutral-700'
                : 'bg-transparent'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={`text-center text-sm font-medium ${
                isActive
                  ? 'text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
