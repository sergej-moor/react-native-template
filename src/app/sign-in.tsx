import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { useLogin } from '@/api/auth/use-login';
import { useResendConfirmation } from '@/api/auth/use-resend-confirmation';
import { useTodos } from '@/api/todos';
import { LoginForm, type LoginFormProps } from '@/components/login-form';
import { FocusAwareStatusBar } from '@/components/ui';
import { useAuth, useIsFirstTime } from '@/lib';

export default function Login() {
  const router = useRouter();
  const { isAnonymous } = useAuth();
  const [, setIsFirstTime] = useIsFirstTime();
  const { data: todos } = useTodos();

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
      setIsFirstTime(false);
      router.replace('/');
    },
    onError: (error, variables) => {
      const errorMessage = error.message.toLowerCase();

      // Check if error is related to email confirmation
      if (
        errorMessage.includes('email not confirmed') ||
        errorMessage.includes('email_not_confirmed')
      ) {
        Alert.alert(
          'Email Not Confirmed',
          'Please check your email and click the confirmation link before signing in.',
          [
            { text: 'OK', style: 'default' },
            {
              text: 'Resend Email',
              onPress: () => {
                if (variables.email) {
                  handleResendConfirmation(variables.email);
                }
              },
            },
          ],
        );
      } else {
        showMessage({ message: error.message, type: 'danger' });
      }
    },
  });

  const onSubmit: LoginFormProps['onSubmit'] = (data) => {
    const hasTodos = todos && todos.length > 0;

    if (isAnonymous && hasTodos) {
      Alert.alert(
        'Warning: Data Loss',
        'You are currently using a guest account with unsaved items. Logging into an existing account will discard your current guest data. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue & Discard',
            style: 'destructive',
            onPress: () => login(data),
          },
        ],
      );
    } else {
      login(data);
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} isLoading={isPending} />
    </>
  );
}
