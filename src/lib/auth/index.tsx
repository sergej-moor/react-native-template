import { type Session, type User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { storage } from '../storage';
import { createSelectors } from '../utils';
import { authService } from './auth-service';

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
    const isAnonymous = user?.is_anonymous ?? false;
    set({
      status: session ? 'signIn' : 'signOut',
      session,
      user,
      isAnonymous,
    });
  },
}));

export const useAuth = createSelectors(_useAuth);

// Listener for Auth State Changes - keeps Zustand store in sync with Supabase
authService.onAuthStateChange((session) => {
  _useAuth.getState().setSession(session);
});

/**
 * Signs out the user and resets app state.
 * After sign out, user will be redirected to onboarding.
 */
export const signOut = async (): Promise<void> => {
  try {
    await authService.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
  } finally {
    // Reset "First Time" flag so user sees Onboarding again
    storage.set('IS_FIRST_TIME', true);
  }
};

/**
 * Initializes auth state on app launch.
 * Attempts to restore existing session or create anonymous session.
 */
export const hydrateAuth = async (): Promise<void> => {
  // Try to get existing session
  const { data: sessionData } = await authService.getSession();

  if (sessionData?.session) {
    _useAuth.getState().setSession(sessionData.session);
    return;
  }

  // No session - try anonymous sign in (soft login)
  const { data: anonData, error: anonError } =
    await authService.signInAnonymously();

  if (anonError) {
    // Anonymous login failed - fall back to signOut state
    _useAuth.getState().setSession(null);
    return;
  }

  if (anonData?.session) {
    _useAuth.getState().setSession(anonData.session);
  }
};
