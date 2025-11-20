import { createMutation } from 'react-query-kit';

import { supabase } from '@/lib/supabase';

type Variables = {
  email: string;
  password: string;
  name?: string;
};

const login = async (variables: Variables): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({
    email: variables.email,
    password: variables.password,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const useLogin = createMutation<void, Variables>({
  mutationFn: login,
  // Auth mutations should not be queued if offline.
  // We want them to fail immediately so the user sees the error.
  networkMode: 'always',
});
