import { createMutation } from 'react-query-kit';

import { supabase } from '@/lib/supabase';

type Variables = {
  email: string;
  password: string;
  name?: string;
};

const signUp = async (variables: Variables): Promise<void> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email: variables.email,
    password: variables.password,
    options: {
      data: {
        name: variables.name,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
  if (!user) {
    throw new Error('Sign up failed: No user returned');
  }
};

export const useSignUp = createMutation<void, Variables>({
  mutationFn: signUp,
});
