// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import interceptors from '@/api/common/interceptors';
import { hydrateAuth, loadSelectedTheme, useAuth, useIsFirstTime } from '@/lib';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
interceptors();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

function GuardedStack() {
  const status = useAuth.use.status();
  const { t } = useTranslation();
  const [isFirstTime] = useIsFirstTime();

  // Clean logic for status bar style to avoid nested ternary
  let statusBarStyle: 'dark' | 'light' = 'light';
  if (isFirstTime) {
    statusBarStyle = 'dark';
  } else if (status === 'signIn') {
    statusBarStyle = 'dark';
  }

  return (
    <Stack>
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
          statusBarStyle,
        }}
      />

      <Stack.Screen name="(app)" options={{ headerShown: false }} />

      <Stack.Screen
        name="update-password"
        options={{
          title: t('updatePassword.title'),
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="sign-in"
        options={{
          title: t('auth.signIn.title'),
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: t('auth.signUp.title'),
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: t('forgotPassword.title'),
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="www"
        options={{
          presentation: 'modal',
          title: '',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Providers>
      <RouterContent />
    </Providers>
  );
}

function RouterContent() {
  const status = useAuth.use.status();

  React.useEffect(() => {
    if (status !== 'idle') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'idle') {
    return null;
  }

  return <GuardedStack />;
}

function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = useThemeConfig();

  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
