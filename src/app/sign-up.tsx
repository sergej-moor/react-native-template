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
    onSuccess: () => {
      showMessage({
        message: `Please check your email and click the confirmation link to activate your account.`,
        type: 'success',
      });
      // Redirect to sign-in page where they can try to log in after confirmation
      router.push('/sign-in');
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
