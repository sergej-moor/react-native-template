import React from 'react';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { Button, Text, View } from '../ui';

type SyncStatus = 'saved' | 'syncing' | 'offline';

type TodoHeaderProps = {
  totalCount: number;
  completedCount: number;
  onClearCompleted: () => void;
  isClearing?: boolean;
  syncStatus?: SyncStatus; // Optional for backward compatibility during refactor
};

const PERCENTAGE_MULTIPLIER = 100;

const CloudIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color}>
    <Path
      d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloudOffIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color}>
    <Path
      d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3M1 1l22 22"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RefreshIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color}>
    <Path
      d="M23 4v6h-6M1 20v-6h6"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SyncIndicator = ({ status }: { status: SyncStatus }) => {
  if (status === 'offline') {
    return (
      <View className="flex-row items-center gap-1">
        <CloudOffIcon color="#ef4444" />
        <Text className="text-xs text-red-500">Offline</Text>
      </View>
    );
  }
  if (status === 'syncing') {
    return (
      <View className="flex-row items-center gap-1">
        <RefreshIcon color="#3b82f6" />
        <Text className="text-xs text-blue-500">Syncing...</Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-center gap-1">
      <CloudIcon color="#22c55e" />
      <Text className="text-xs text-green-500">Saved</Text>
    </View>
  );
};

export function TodoHeader({
  totalCount,
  completedCount,
  onClearCompleted,
  isClearing = false,
  syncStatus = 'saved',
}: TodoHeaderProps) {
  const { t } = useTranslation();

  const percentage =
    totalCount === 0
      ? 0
      : Math.round((completedCount / totalCount) * PERCENTAGE_MULTIPLIER);

  return (
    <View className="gap-4">
      {/* Top Row: Sync Status & Clear Button */}
      <View className="flex-row items-center justify-between">
        <SyncIndicator status={syncStatus} />

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

      {/* Progress Bar Row */}
      <View className="gap-2">
        <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {totalCount === 0
            ? t('todos.noTodos')
            : t('todos.progress', {
                completed: completedCount,
                total: totalCount,
              })}
        </Text>

        {totalCount > 0 && (
          <View className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <View
              className="h-full rounded-full bg-primary-500 dark:bg-primary-600"
              style={{ width: `${percentage}%` }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
