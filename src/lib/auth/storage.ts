import type { Session, User } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';

const storageKey = 'supabase-auth-storage';

export const authStorage = new MMKV({
  id: storageKey,
});

export const STORAGE_KEYS = {
  SESSION: 'supabase-session',
  USER: 'supabase-user',
};

// Helper functions for session management
export const getStoredSession = (): Session | null => {
  try {
    const sessionString = authStorage.getString(STORAGE_KEYS.SESSION);
    return sessionString ? JSON.parse(sessionString) : null;
  } catch {
    return null;
  }
};

export const setStoredSession = (session: Session | null): void => {
  if (session) {
    authStorage.set(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } else {
    authStorage.delete(STORAGE_KEYS.SESSION);
  }
};

export const getStoredUser = (): User | null => {
  try {
    const userString = authStorage.getString(STORAGE_KEYS.USER);
    return userString ? JSON.parse(userString) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User | null): void => {
  if (user) {
    authStorage.set(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    authStorage.delete(STORAGE_KEYS.USER);
  }
};

export const clearAuthStorage = (): void => {
  authStorage.delete(STORAGE_KEYS.SESSION);
  authStorage.delete(STORAGE_KEYS.USER);
};
