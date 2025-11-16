import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Text, View } from '../ui';

type TodoHeaderProps = {
  totalCount: number;
  completedCount: number;
  onClearCompleted: () => void;
  isClearing?: boolean;
};

const PERCENTAGE_MULTIPLIER = 100;

export function TodoHeader({
  totalCount,
  completedCount,
  onClearCompleted,
  isClearing = false,
}: TodoHeaderProps) {
  const { t } = useTranslation();

  const percentage =
    totalCount === 0
      ? 0
      : Math.round((completedCount / totalCount) * PERCENTAGE_MULTIPLIER);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {totalCount === 0
            ? t('todos.noTodos')
            : t('todos.progress', {
                completed: completedCount,
                total: totalCount,
              })}
        </Text>

        <Button
          label={t('todos.clearCompleted')}
          onPress={onClearCompleted}
          loading={isClearing}
          variant="ghost"
          size="sm"
          disabled={completedCount === 0}
          testID="clear-completed-button"
        />
      </View>

      {totalCount > 0 && (
        <View className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <View
            className="h-full rounded-full bg-primary-500 dark:bg-primary-600"
            style={{ width: `${percentage}%` }}
          />
        </View>
      )}
    </View>
  );
}
