import * as Linking from 'expo-linking';
import { createMutation } from 'react-query-kit';

import { useAuth } from '@/lib';
import { authService } from '@/lib/auth/auth-service';

type Variables = {
  email: string;
  password: string;
  name?: string;
};

const signUpOrUpdate = async (variables: Variables): Promise<void> => {
  const { user: currentUser } = useAuth.getState();
  const isAnonymous = currentUser?.is_anonymous ?? false;

  if (isAnonymous) {
    // Convert Guest -> Registered User (preserves user ID and data)
    const { error } = await authService.updateUser({
      email: variables.email,
      password: variables.password,
      data: variables.name ? { name: variables.name } : undefined,
    });

    if (error) {
      throw error;
    }
  } else {
    // Standard Sign Up (creates new user)
    const { error } = await authService.signUp({
      email: variables.email,
      password: variables.password,
      name: variables.name,
      emailRedirectTo: Linking.createURL('/'),
    });

    if (error) {
      throw error;
    }
  }
};

export const useSignUp = createMutation<void, Variables>({
  mutationFn: signUpOrUpdate,
  // Auth mutations should not be queued if offline - fail immediately
  networkMode: 'always',
});
