import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Text, View } from '../ui';

type TodoHeaderProps = {
  completedCount: number;
  onClearCompleted: () => void;
  isClearing?: boolean;
};

export function TodoHeader({
  completedCount,
  onClearCompleted,
  isClearing = false,
}: TodoHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between px-4 pb-4">
      <View>
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {t('todos.title')}
        </Text>
        {completedCount > 0 && (
          <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {t('todos.completedCount', { count: completedCount })}
          </Text>
        )}
      </View>

      {completedCount > 0 && (
        <Button
          label={t('todos.clearCompleted')}
          onPress={onClearCompleted}
          loading={isClearing}
          variant="outline"
          size="sm"
          testID="clear-completed-button"
        />
      )}
    </View>
  );
}
