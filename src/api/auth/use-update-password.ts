import { createMutation } from 'react-query-kit';

import { authService } from '@/lib/auth/auth-service';

type Variables = {
  password: string;
};

type Response = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
  };
};

const updatePasswordRequest = async (
  variables: Variables,
): Promise<Response> => {
  const { data, error } = await authService.updateUser({
    password: variables.password,
  });

  if (error) {
    throw error;
  }

  return {
    success: true,
    message: 'Password updated successfully',
    user: data
      ? {
          id: data.userId,
          email: data.email,
        }
      : undefined,
  };
};

export const useUpdatePassword = createMutation<Response, Variables>({
  mutationFn: updatePasswordRequest,
  // Auth mutations should not be queued if offline - fail immediately
  networkMode: 'always',
});
