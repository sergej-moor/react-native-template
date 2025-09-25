import { Env } from '@env';
import { createMutation } from 'react-query-kit';

import { supabase } from '@/lib/supabase';

type Variables = {
  email: string;
};

type Response = {
  message: string;
};

const sendForgotPasswordInstructions = async (
  variables: Variables,
): Promise<Response> => {
  const { error } = await supabase.auth.resetPasswordForEmail(variables.email, {
    redirectTo: `${Env.WEBSITE_URL}/update-password`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    message: 'Password reset instructions sent to your email',
  };
};

export const useForgotPassword = createMutation<Response, Variables>({
  mutationFn: (variables) => sendForgotPasswordInstructions(variables),
});
