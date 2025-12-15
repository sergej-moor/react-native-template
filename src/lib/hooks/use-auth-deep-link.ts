import { Env } from '@env';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { authService } from '../auth/auth-service';
import { storage } from '../storage';

const APP_SCHEME = `${Env.SCHEME}://`;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  type?: string | null;
};

type Router = ReturnType<typeof useRouter>;

/**
 * Parses auth tokens from URL hash fragment.
 * Supabase returns tokens in the format: {scheme}://auth/callback#access_token=...&refresh_token=...
 * @param url - The full URL containing the hash fragment
 * @returns Parsed tokens or null if not found
 */
export function parseTokensFromHash(url: string): AuthTokens | null {
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
 * @param queryParams - Query params object from Linking.parse()
 * @returns Parsed tokens or null if not found
 */
export function parseTokensFromQuery(
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

/**
 * Checks if a URL is an auth deep link.
 * @param url - The URL to check
 * @param scheme - The app scheme (defaults to APP_SCHEME)
 * @returns True if the URL is an auth deep link
 */
export function isAuthDeepLink(
  url: string | null,
  scheme = APP_SCHEME,
): boolean {
  if (!url) {
    return false;
  }
  return (
    url.startsWith(scheme) &&
    (url.includes('access_token') || url.includes('refresh_token'))
  );
}

/**
 * Sets the auth session and navigates to the appropriate screen.
 */
async function handleAuthSession(
  tokens: AuthTokens,
  router: Router,
): Promise<void> {
  const { error } = await authService.setSession(
    tokens.accessToken,
    tokens.refreshToken,
  );

  if (error) {
    console.error('Auth SetSession Error:', error);
    return;
  }

  storage.set('IS_FIRST_TIME', false);

  if (tokens.type === 'recovery') {
    router.replace('/update-password');
  } else {
    router.replace('/');
  }
}

/**
 * Hook that handles auth deep links (email verification, password reset).
 * Should be used in the root layout to catch auth callbacks.
 */
export function useAuthDeepLink(): void {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }): void => {
      const url = event.url;

      if (!isAuthDeepLink(url)) {
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
}
