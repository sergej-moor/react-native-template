import React from 'react';

import { cleanup, screen, setup } from '@/lib/test-utils';

import { EmptyState } from './empty-state';

afterEach(cleanup);

describe('EmptyState', () => {
  describe('Rendering - All Filter', () => {
    test('renders correct content for "all" filter', async () => {
      setup(<EmptyState filter="all" />);

      expect(await screen.findByText('No todos yet')).toBeOnTheScreen();
      expect(
        screen.getByText('Create your first todo to get started.'),
      ).toBeOnTheScreen();
    });
  });

  describe('Rendering - Active Filter', () => {
    test('renders correct content for "active" filter', async () => {
      setup(<EmptyState filter="active" />);

      expect(await screen.findByText('All caught up')).toBeOnTheScreen();
      expect(
        screen.getByText('You have no active todos. Great job!'),
      ).toBeOnTheScreen();
    });
  });

  describe('Rendering - Completed Filter', () => {
    test('renders correct content for "completed" filter', async () => {
      setup(<EmptyState filter="completed" />);

      expect(await screen.findByText('No completed todos')).toBeOnTheScreen();
      expect(
        screen.getByText('Completed todos will appear here.'),
      ).toBeOnTheScreen();
    });
  });
});
