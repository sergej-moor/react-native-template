import { createMutation } from 'react-query-kit';

import { useAuth } from '@/lib';
import { supabase } from '@/lib/supabase';

type Variables = {
  email: string;
  password: string;
  name?: string;
};

const signUpOrUpdate = async (variables: Variables): Promise<void> => {
  const { user: currentUser } = useAuth.getState();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAnonymous = (currentUser as any)?.is_anonymous;

  let result;

  if (isAnonymous) {
    // Convert Guest -> Registered User
    // This preserves the User ID and all associated data
    result = await supabase.auth.updateUser({
      email: variables.email,
      password: variables.password,
      data: {
        name: variables.name,
      },
    });
  } else {
    // Standard Sign Up (creates new user)
    result = await supabase.auth.signUp({
      email: variables.email,
      password: variables.password,
      options: {
        data: {
          name: variables.name,
        },
      },
    });
  }

  const {
    data: { user },
    error,
  } = result;

  if (error) {
    throw new Error(error.message);
  }
  if (!user) {
    throw new Error('Sign up failed: No user returned');
  }
};

export const useSignUp = createMutation<void, Variables>({
  mutationFn: signUpOrUpdate,
});
