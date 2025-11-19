import { type Session, type User } from '@supabase/supabase-js';
import { create } from 'zustand';

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

// Helper to sign out
export const signOut = async () => {
  await supabase.auth.signOut();
};

// Helper to initialize auth check (usually called in _layout.tsx)
export const hydrateAuth = async () => {
  // The onAuthStateChange listener will fire automatically on initialization
  // but we can force a check here if needed to unblock the splash screen faster.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  _useAuth.getState().setSession(session);
};
