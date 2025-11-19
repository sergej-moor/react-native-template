import type { InternalAxiosRequestConfig } from 'axios';

import { useAuth } from '@/lib';
import { Env } from '@/lib/env';

import { client } from './client';

const AUTHORIZATION_HEADER = 'Authorization';
const API_KEY_HEADER = 'apikey';

export default function interceptors() {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Now this reads from the reactive Zustand store which is kept in sync
    // by the Supabase listener. This is safe and correct.
    const session = useAuth.getState().session;

    if (session) {
      config.headers[AUTHORIZATION_HEADER] = `Bearer ${session.access_token}`;
      config.headers[API_KEY_HEADER] = Env.SUPABASE_ANON_KEY;
    }

    return config;
  });
}
