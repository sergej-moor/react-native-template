import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { storage } from '../storage';
import { supabase } from '../supabase';

export const useAuthDeepLink = () => {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      // Check if the URL matches our scheme and contains auth tokens
      if (
        url &&
        url.startsWith('startuptemplate://') &&
        (url.includes('access_token') || url.includes('refresh_token'))
      ) {
        // Extract tokens from the fragment part of the URL
        // Supabase returns: startuptemplate://auth/callback#access_token=...&refresh_token=...&...

        // Expo Linking.parse might put the fragment in path or queryParams depending on format
        // But often it's easier to just regex the raw string for fragments if standard parsing fails on fragments

        // Let's try standard parsing first
        const parsed = Linking.parse(url);

        // If tokens are in the hash (fragment)
        // Linking.parse often puts the hash into path or null if it's a pure hash on root

        // We can manually parse the hash from the raw URL to be safe
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const hash = url.substring(hashIndex + 1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type'); // 'recovery', 'signup', 'invite', etc.

          if (accessToken && refreshToken) {
            supabase.auth
              .setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              .then(({ error }) => {
                if (error) {
                  console.error('Supabase SetSession Error:', error);
                } else {
                  try {
                    storage.set('IS_FIRST_TIME', false);

                    if (type === 'recovery') {
                      router.replace('/update-password');
                    } else {
                      router.replace('/');
                    }
                  } catch (e) {
                    console.error('Failed to set first time flag', e);
                  }
                }
              });
            return;
          }
        }

        // Fallback: Supabase might sometimes put them in query params (for password resets sometimes)
        if (
          parsed.queryParams?.access_token &&
          parsed.queryParams?.refresh_token
        ) {
          supabase.auth.setSession({
            access_token: parsed.queryParams.access_token as string,
            refresh_token: parsed.queryParams.refresh_token as string,
          });
        }
      }
    };

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]);
};
