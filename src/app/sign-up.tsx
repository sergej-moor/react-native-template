import { useRouter } from 'expo-router';
import React from 'react';
import { showMessage } from 'react-native-flash-message';

import { useSignUp } from '@/api/auth/use-sign-up';
import type { SignUpFormProps } from '@/components/sign-up-form';
import { SignUpForm } from '@/components/sign-up-form';
import { FocusAwareStatusBar } from '@/components/ui';

export default function SignUp() {
  const router = useRouter();

  const { mutate: signUp, isPending } = useSignUp({
    onSuccess: (response) => {
      if (response.needsEmailConfirmation) {
        // Show message about email confirmation
        showMessage({
          message: `Please check your email (${response.user.email}) and click the confirmation link to activate your account.`,
          type: 'info',
          duration: 8000, // Show for 8 seconds
        });
        // Redirect to sign-in page where they can try to log in after confirmation
        router.push('/sign-in');
      } else {
        // Email confirmation not required, go to app
        router.push('/');
      }
    },
    onError: (error) => showMessage({ message: error.message, type: 'danger' }),
  });

  const onSubmit: SignUpFormProps['onSubmit'] = (data) => {
    signUp(data);
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SignUpForm onSubmit={onSubmit} isPending={isPending} />
    </>
  );
}
