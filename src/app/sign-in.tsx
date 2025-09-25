import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { useLogin } from '@/api/auth/use-login';
import { useResendConfirmation } from '@/api/auth/use-resend-confirmation';
import { LoginForm, type LoginFormProps } from '@/components/login-form';
import { FocusAwareStatusBar } from '@/components/ui';

export default function Login() {
  const router = useRouter();

  const { mutate: resendConfirmation } = useResendConfirmation({
    onSuccess: () => {
      showMessage({
        message: 'Confirmation email sent! Please check your inbox.',
        type: 'success',
      });
    },
    onError: (error) => {
      showMessage({ message: error.message, type: 'danger' });
    },
  });

  const handleResendConfirmation = (email: string) => {
    Alert.alert(
      'Resend Confirmation Email',
      `Send a new confirmation email to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => resendConfirmation({ email }),
        },
      ],
    );
  };

  const { mutate: login, isPending } = useLogin({
    onSuccess: () => {
      router.push('/');
    },
    onError: (error, variables) => {
      const errorMessage = error.message.toLowerCase();

      // Check if error is related to email confirmation
      if (
        errorMessage.includes('email not confirmed') ||
        errorMessage.includes('confirm your email') ||
        errorMessage.includes('email_not_confirmed')
      ) {
        Alert.alert(
          'Email Not Confirmed',
          'Please check your email and click the confirmation link before signing in.',
          [
            { text: 'OK', style: 'default' },
            {
              text: 'Resend Email',
              onPress: () => handleResendConfirmation(variables.email),
            },
          ],
        );
      } else {
        showMessage({ message: error.message, type: 'danger' });
      }
    },
  });

  const onSubmit: LoginFormProps['onSubmit'] = (data) => {
    login(data);
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} isLoading={isPending} />
    </>
  );
}
