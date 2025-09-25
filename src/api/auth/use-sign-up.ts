import { createMutation } from 'react-query-kit';

import { supabase } from '@/lib/supabase';

type Variables = {
  email: string;
  password: string;
  name?: string;
  passwordConfirmation?: string; // Optional for backwards compatibility but not used
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
  } | null;
  needsEmailConfirmation: boolean;
};

const signUp = async (variables: Variables): Promise<Response> => {
  const { data, error } = await supabase.auth.signUp({
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

  if (!data.user) {
    throw new Error('Sign up failed: No user returned');
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      user_metadata: data.user.user_metadata,
    },
    session: data.session
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        }
      : null,
    needsEmailConfirmation: !data.session, // If no session, email confirmation is required
  };
};

export const useSignUp = createMutation<Response, Variables>({
  mutationFn: (variables) => signUp(variables),
});
