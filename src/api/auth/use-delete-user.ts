import { createMutation } from 'react-query-kit';

import { authService } from '@/lib/auth/auth-service';

export type DeleteUserVariables = {
  email?: string; // Not used, kept for backwards compatibility
};

const deleteUser = async (_variables: DeleteUserVariables): Promise<void> => {
  // Verify user is authenticated
  const { error: userError } = await authService.getUser();

  if (userError) {
    throw userError;
  }

  // Delete the user account (requires custom RPC function in Supabase)
  const { error } = await authService.deleteUser();

  if (error) {
    // Fallback: Sign out if delete function is not available
    await authService.signOut();
    throw new Error(
      'Account deletion requested. Please contact support to complete the process.',
    );
  }
};

export const useDeleteUser = createMutation<void, DeleteUserVariables>({
  mutationFn: deleteUser,
  // Auth mutations should not be queued if offline - fail immediately
  networkMode: 'always',
});
