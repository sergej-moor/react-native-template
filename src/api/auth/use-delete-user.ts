import { createMutation } from 'react-query-kit';

import { supabase } from '@/lib/supabase';

export type DeleteUserVariables = {
  email?: string; // Not used in Supabase delete, but kept for backwards compatibility
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

export const useDeleteUser = createMutation<void, DeleteUserVariables>({
  mutationFn: deleteUser,
});
