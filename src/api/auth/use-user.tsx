import { createMutation, createQuery } from 'react-query-kit';

import { supabase } from '@/lib/supabase';

export type User = {
  id: string;
  email: string;
  name?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type DeleteUserVariables = {
  email?: string; // Not used in Supabase delete, but kept for backwards compatibility
};

const getUser = async (): Promise<User> => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('No user found');
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name,
    user_metadata: data.user.user_metadata,
    created_at: data.user.created_at,
    updated_at: data.user.updated_at,
  };
};

const deleteUser = async (_variables: DeleteUserVariables): Promise<void> => {
  // Get current user first
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('No authenticated user found');
  }

  // Delete the user account
  const { error } = await supabase.rpc('delete_user'); // This requires a custom RPC function in Supabase

  if (error) {
    // Fallback: Sign out the user if delete function is not available
    await supabase.auth.signOut();
    throw new Error(
      'Account deletion requested. Please contact support to complete the process.',
    );
  }
};

export const useUser = createQuery<User>({
  queryKey: ['getUser'],
  fetcher: getUser,
});

export const useDeleteUser = createMutation<void, DeleteUserVariables>({
  mutationFn: deleteUser,
});
