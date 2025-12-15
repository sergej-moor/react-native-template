import { Env } from '@env';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { storage } from '../storage';
import { supabase } from '../supabase';

const APP_SCHEME = `${Env.SCHEME}://`;

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  type?: string | null;
};

type Router = ReturnType<typeof useRouter>;

/**
 * Sets the Supabase session and navigates to the appropriate screen.
 * Handles both email verification and password recovery deep links.
 */
function handleAuthSession(tokens: AuthTokens, router: Router): void {
  supabase.auth
    .setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    })
    .then(({ error }) => {
      if (error) {
        console.error('Supabase SetSession Error:', error);
        return;
      }

      storage.set('IS_FIRST_TIME', false);

      if (tokens.type === 'recovery') {
        router.replace('/update-password');
      } else {
        router.replace('/');
      }
    });
}

/**
 * Parses auth tokens from URL hash fragment.
 * Supabase returns tokens in the format: {scheme}://auth/callback#access_token=...&refresh_token=...
 */
function parseTokensFromHash(url: string): AuthTokens | null {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) {
    return null;
  }

  const hash = url.substring(hashIndex + 1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    type: params.get('type'),
  };
}

/**
 * Parses auth tokens from URL query params (fallback for some Supabase flows).
 */
function parseTokensFromQuery(
  queryParams: Linking.QueryParams | null | undefined,
): AuthTokens | null {
  if (!queryParams?.access_token || !queryParams?.refresh_token) {
    return null;
  }

  return {
    accessToken: queryParams.access_token as string,
    refreshToken: queryParams.refresh_token as string,
    type: queryParams.type as string | undefined,
  };
}

export const useAuthDeepLink = (): void => {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }): void => {
      const url = event.url;

      // Only handle URLs that match our scheme and contain auth tokens
      const isAuthUrl =
        url?.startsWith(APP_SCHEME) &&
        (url.includes('access_token') || url.includes('refresh_token'));

      if (!isAuthUrl) {
        return;
      }

      // Try parsing tokens from hash fragment first (primary method)
      const hashTokens = parseTokensFromHash(url);
      if (hashTokens) {
        handleAuthSession(hashTokens, router);
        return;
      }

      // Fallback: try parsing from query params
      const parsed = Linking.parse(url);
      const queryTokens = parseTokensFromQuery(parsed.queryParams);
      if (queryTokens) {
        handleAuthSession(queryTokens, router);
      }
    };

    // Handle the URL that launched the app
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for incoming deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]);
};
