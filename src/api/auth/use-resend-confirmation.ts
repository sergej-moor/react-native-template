import { createMutation } from 'react-query-kit';

import { supabase } from '@/lib/supabase';

type Variables = {
  email: string;
};

type Response = {
  message: string;
};

const resendConfirmation = async (variables: Variables): Promise<Response> => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: variables.email,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    message: 'Confirmation email sent successfully',
  };
};

export const useResendConfirmation = createMutation<Response, Variables>({
  mutationFn: (variables) => resendConfirmation(variables),
});
