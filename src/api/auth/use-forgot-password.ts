import { Env } from '@env';
import { createMutation } from 'react-query-kit';

import { authService } from '@/lib/auth/auth-service';

type Variables = {
  email: string;
};

type Response = {
  message: string;
};

const sendForgotPasswordInstructions = async (
  variables: Variables,
): Promise<Response> => {
  const { error } = await authService.resetPasswordForEmail({
    email: variables.email,
    redirectTo: `${Env.WEBSITE_URL}/update-password`,
  });

  if (error) {
    throw error;
  }

  return {
    message: 'Password reset instructions sent to your email',
  };
};

export const useForgotPassword = createMutation<Response, Variables>({
  mutationFn: sendForgotPasswordInstructions,
  // Auth mutations should not be queued if offline - fail immediately
  networkMode: 'always',
});
