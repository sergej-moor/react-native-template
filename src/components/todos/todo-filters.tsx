import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import type { TodoFilters } from '@/lib/todos';

import { Text, View } from '../ui';

type TodoFiltersProps = {
  activeFilter: TodoFilters;
  onFilterChange: (filter: TodoFilters) => void;
  stats: {
    all: number;
    active: number;
    completed: number;
  };
};

export function TodoFiltersComponent({
  activeFilter,
  onFilterChange,
  stats,
}: TodoFiltersProps) {
  const { t } = useTranslation();

  const filters: Array<{ key: TodoFilters; label: string; count: number }> = [
    { key: 'all', label: t('todos.filters.all'), count: stats.all },
    { key: 'active', label: t('todos.filters.active'), count: stats.active },
    {
      key: 'completed',
      label: t('todos.filters.completed'),
      count: stats.completed,
    },
  ];

  return (
    <View className="flex-row gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            className={`flex-1 rounded-lg px-4 py-3 ${
              isActive
                ? 'bg-primary-500 dark:bg-primary-600'
                : 'bg-neutral-100 dark:bg-neutral-800'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={`text-center text-sm font-medium ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {filter.label}
            </Text>
            <Text
              className={`text-center text-xs ${
                isActive
                  ? 'text-white/80'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {filter.count}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
