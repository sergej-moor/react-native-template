import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Pressable } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Svg, { Path } from 'react-native-svg';
import { object, string, type z } from 'zod';

import { Button, ControlledInput, Text, View } from '@/components/ui';
import { translate } from '@/lib';

const MIN_PASSWORD_LENGTH = 8;

const passwordSchema = string({
  required_error: translate('auth.signUp.error.passwordRequired'),
})
  .min(MIN_PASSWORD_LENGTH, translate('auth.signUp.error.shortPassword'))
  .regex(/[A-Z]/, translate('auth.signUp.error.passwordUppercase'))
  .regex(/[0-9!@#$%^&*]/, translate('auth.signUp.error.passwordSpecial'));

// Removed passwordConfirmation from schema
const schema = object({
  email: string({
    required_error: translate('auth.signUp.error.emailRequired'),
  }).email(translate('auth.signUp.error.emailInvalid')),
  name: string({
    required_error: translate('auth.signUp.error.nameRequired'),
  }),
  password: passwordSchema,
});

export type FormType = z.infer<typeof schema>;

export type SignUpFormProps = {
  onSubmit?: SubmitHandler<FormType>;
  isPending?: boolean;
};

const EyeIcon = ({ color = '#6b7280' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color}>
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeOffIcon = ({ color = '#6b7280' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color}>
    <Path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 1l22 22"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SignUpForm = ({
  onSubmit = () => {},
  isPending = false,
}: SignUpFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center gap-4 p-4">
        <Text testID="form-title" className="text-center text-2xl">
          {translate('auth.signUp.title')}
        </Text>
        <View>
          <ControlledInput
            testID="email-input"
            autoCapitalize="none"
            autoComplete="email"
            control={control}
            name="email"
            label={translate('auth.signUp.fields.email')}
          />
          <ControlledInput
            testID="name-input"
            control={control}
            name="name"
            label={translate('auth.signUp.fields.name')}
          />
          <View className="relative">
            <ControlledInput
              testID="password-input"
              control={control}
              name="password"
              label={translate('auth.signUp.fields.password')}
              placeholder="***"
              secureTextEntry={!isPasswordVisible}
            />
            <Pressable
              className="absolute bottom-3.5 right-4 z-10"
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
            </Pressable>
          </View>

          <Button
            testID="sign-up-button"
            label={translate('auth.signUp.signUpButton')}
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isPending}
          />
          <View className="mt-4 items-center">
            <Text>
              Already have an account?{' '}
              <Link href="/sign-in" disabled={isPending} replace>
                <Text className="font-bold text-primary-500">Sign In</Text>
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
