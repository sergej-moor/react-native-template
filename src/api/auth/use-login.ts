import { createMutation } from 'react-query-kit';

import { authService } from '@/lib/auth/auth-service';

type Variables = {
  email: string;
  password: string;
};

const login = async (variables: Variables): Promise<void> => {
  const { error } = await authService.signInWithPassword({
    email: variables.email,
    password: variables.password,
  });

  if (error) {
    throw error;
  }
};

export const useLogin = createMutation<void, Variables>({
  mutationFn: login,
  // Auth mutations should not be queued if offline - fail immediately
  networkMode: 'always',
});
