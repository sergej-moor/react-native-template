import { type Session, type User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../supabase';
import { createSelectors } from '../utils';
import {
  clearAuthStorage,
  getStoredSession,
  setStoredSession,
  setStoredUser,
} from './storage';

interface AuthState {
  session: Session | null;
  user: User | null;
  status: 'idle' | 'signOut' | 'signIn';
  signIn: (session: Session, user: User) => void;
  signOut: () => void;
  hydrate: () => Promise<void>;
}

const _useAuth = create<AuthState>((set) => ({
  status: 'idle',
  session: null,
  user: null,
  signIn: (session, user) => {
    setStoredSession(session);
    setStoredUser(user);
    set({ status: 'signIn', session, user });
  },
  signOut: () => {
    clearAuthStorage();
    set({ status: 'signOut', session: null, user: null });
  },
  hydrate: async () => {
    try {
      const storedSession = getStoredSession();
      if (!storedSession) {
        set({ status: 'signOut', session: null, user: null });
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: storedSession.access_token,
        refresh_token: storedSession.refresh_token,
      });

      if (error) {
        clearAuthStorage();
        set({ status: 'signOut', session: null, user: null });
      } else if (data.session && data.user) {
        setStoredSession(data.session);
        setStoredUser(data.user);
        set({ status: 'signIn', session: data.session, user: data.user });
      } else {
        clearAuthStorage();
        set({ status: 'signOut', session: null, user: null });
      }
    } catch {
      set({ status: 'signOut', session: null, user: null });
    }
  },
}));

supabase.auth.onAuthStateChange(async (event, session) => {
  const user = session?.user ?? null;

  switch (event) {
    case 'SIGNED_IN':
    case 'TOKEN_REFRESHED':
    case 'USER_UPDATED':
      if (session && user) {
        _useAuth.getState().signIn(session, user);
      }
      break;
    case 'SIGNED_OUT':
      _useAuth.getState().signOut();
      break;
    default:
      break;
  }
});

export const useAuth = createSelectors(_useAuth);

export const signOut = async () => {
  await supabase.auth.signOut();
};
export const signIn = (session: Session, user: User) =>
  _useAuth.getState().signIn(session, user);
export const hydrateAuth = () => _useAuth.getState().hydrate();
