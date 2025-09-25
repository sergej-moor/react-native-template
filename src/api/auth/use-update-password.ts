import { createMutation } from 'react-query-kit';

import { supabase } from '@/lib/supabase';

type Variables = {
  password: string;
  passwordConfirmation?: string; // Optional for backwards compatibility but not used
};

type Response = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  };
};

const updatePasswordRequest = async (
  variables: Variables,
): Promise<Response> => {
  const { data, error } = await supabase.auth.updateUser({
    password: variables.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Password update failed: No user returned');
  }

  return {
    success: true,
    message: 'Password updated successfully',
    user: {
      id: data.user.id,
      email: data.user.email!,
      user_metadata: data.user.user_metadata,
    },
  };
};

export const useUpdatePassword = createMutation<Response, Variables>({
  mutationFn: (variables) => updatePasswordRequest(variables),
});
