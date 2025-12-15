import { createMutation } from 'react-query-kit';

import { authService } from '@/lib/auth/auth-service';

type Variables = {
  email: string;
};

type Response = {
  message: string;
};

const resendConfirmation = async (variables: Variables): Promise<Response> => {
  const { error } = await authService.resendConfirmation(variables.email);

  if (error) {
    throw error;
  }

  return {
    message: 'Confirmation email sent successfully',
  };
};

export const useResendConfirmation = createMutation<Response, Variables>({
  mutationFn: resendConfirmation,
  // Auth mutations should not be queued if offline - fail immediately
  networkMode: 'always',
});
