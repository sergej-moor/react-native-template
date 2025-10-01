export type TodoFilters = 'all' | 'active' | 'completed';

export type TodoSortBy = 'createdAt' | 'updatedAt' | 'title';

export type SyncStatus = 'synced' | 'pending' | 'error';

export type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  userId?: string;
  syncStatus?: SyncStatus;
  lastSyncedAt?: string;
};

export type CreateTodoInput = {
  title: string;
  description?: string;
};

export type UpdateTodoInput = {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
};

export type TodoStats = {
  total: number;
  active: number;
  completed: number;
};
