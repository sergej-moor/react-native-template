import { createMutation } from 'react-query-kit';

import { supabase } from '@/lib/supabase';

type Variables = {
  email: string;
  password: string;
};

type Response = {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
  };
};

const login = async (variables: Variables): Promise<Response> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: variables.email,
    password: variables.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user || !data.session) {
    throw new Error('Login failed: No user or session returned');
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      user_metadata: data.user.user_metadata,
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
  };
};

export const useLogin = createMutation<Response, Variables>({
  mutationFn: (variables) => login(variables),
});
