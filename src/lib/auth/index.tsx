import { type Session, type User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { storage } from '../storage';
import { supabase } from '../supabase';
import { createSelectors } from '../utils';

interface AuthState {
  session: Session | null;
  user: User | null;
  isAnonymous: boolean;
  status: 'idle' | 'signOut' | 'signIn';
  setSession: (session: Session | null) => void;
}

const _useAuth = create<AuthState>((set) => ({
  status: 'idle',
  session: null,
  user: null,
  isAnonymous: false,
  setSession: (session) => {
    const user = session?.user ?? null;
    // Supabase users have an 'is_anonymous' flag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAnonymous = (user as any)?.is_anonymous ?? false;
    set({
      status: session ? 'signIn' : 'signOut',
      session,
      user,
      isAnonymous,
    });
  },
}));

export const useAuth = createSelectors(_useAuth);

// Listener for Auth State Changes
// This keeps the Zustand store in sync with Supabase's internal state
supabase.auth.onAuthStateChange((_event, session) => {
  _useAuth.getState().setSession(session);
});

// Helper to sign out and reset app state
export const signOut = async () => {
  // 1. Sign out from Supabase (clears session)
  await supabase.auth.signOut();

  // 2. Reset "First Time" flag so user sees Onboarding again
  // We must manually set this because we are outside a React component
  storage.set('IS_FIRST_TIME', true);

  // 3. We DO NOT sign in anonymously here.
  // The router will see 'isFirstTime' is true and redirect to /onboarding.
  // The user will click "Get Started" -> which sets isFirstTime=false -> redirects to /.
  // Then hydrateAuth (or a listener) will kick in and create a new anonymous session.
};

// Helper to initialize auth check (usually called in _layout.tsx)
export const hydrateAuth = async () => {
  // 1. Try to get the existing session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 2. If session exists, sync to store and we are good
  if (session) {
    _useAuth.getState().setSession(session);
    return;
  }

  // 3. If NO session, try to sign in anonymously (Soft Login)
  const { data: anonData, error: anonError } =
    await supabase.auth.signInAnonymously();

  if (anonError) {
    // If anonymous login fails (e.g., network error, or not enabled in dashboard),
    // we fall back to 'signOut' state so the user at least sees the login screen
    // or stays on the splash screen depending on logic.
    // Setting session to null triggers 'signOut' status.
    _useAuth.getState().setSession(null);
    return;
  }

  // 4. If anonymous login succeeded, set the new anonymous session
  if (anonData.session) {
    _useAuth.getState().setSession(anonData.session);
  }
};
