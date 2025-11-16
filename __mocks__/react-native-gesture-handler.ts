import React from 'react';
import { View } from 'react-native';

type SwipeableProps = {
  children: React.ReactNode;
  renderRightActions?: () => React.ReactNode;
  onSwipeableOpen?: () => void;
  overshootRight?: boolean;
  rightThreshold?: number;
  ref?: React.Ref<unknown>;
};

const Swipeable = ({ children }: SwipeableProps) =>
  React.createElement(View, {}, children);

export { Swipeable };
export default { Swipeable };
