import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import type { TodoFilters } from '@/lib/todos';

import { Text, View } from '../ui';

type IconProps = {
  size: number;
  className?: string;
  color?: string;
};

const ListTodoIcon = ({ size, color = '#d4d4d8' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckCircleIcon = ({ size, color = '#d4d4d8' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
    <Path
      d="m9 12 2 2 4-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SparklesIcon = ({ size, color = '#d4d4d8' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364-2.121 2.121M8.757 15.243l-2.121 2.121M18.364 18.364l-2.121-2.121M8.757 8.757 6.636 6.636"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type EmptyStateProps = {
  filter: TodoFilters;
};

export function EmptyState({ filter }: EmptyStateProps) {
  const getEmptyStateContent = () => {
    switch (filter) {
      case 'active':
        return {
          icon: CheckCircleIcon,
          title: 'All caught up',
          description: 'You have no active todos. Great job!',
        };
      case 'completed':
        return {
          icon: SparklesIcon,
          title: 'No completed todos',
          description: 'Completed todos will appear here.',
        };
      case 'all':
      default:
        return {
          icon: ListTodoIcon,
          title: 'No todos yet',
          description: 'Create your first todo to get started.',
        };
    }
  };

  const { icon: Icon, title, description } = getEmptyStateContent();

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Icon size={64} color="#d4d4d8" />
      <Text className="mt-4 text-center text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </Text>
      <Text className="mt-2 text-center text-base text-neutral-600 dark:text-neutral-400">
        {description}
      </Text>
    </View>
  );
}
