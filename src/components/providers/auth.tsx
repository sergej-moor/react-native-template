import type { Session, User } from '@supabase/supabase-js';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { MMKV } from 'react-native-mmkv';

import { supabase } from '@/lib/supabase';

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

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  ready: boolean; // For backwards compatibility with existing components
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const useAuthStateHandling = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateAuthState = useCallback(
    (newSession: Session | null, newUser: User | null) => {
      setSession(newSession);
      setUser(newUser);
      setStoredSession(newSession);
      setStoredUser(newUser);
    },
    [],
  );

  return { user, session, loading, setLoading, updateAuthState };
};

const useAuthActions = (
  updateAuthState: (session: Session | null, user: User | null) => void,
) => {
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Error refreshing session:', error);
        clearAuthStorage();
        updateAuthState(null, null);
        return;
      }

      if (data.session) {
        updateAuthState(data.session, data.user);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      clearAuthStorage();
      updateAuthState(null, null);
    }
  }, [updateAuthState]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      clearAuthStorage();
      updateAuthState(null, null);
    } catch (error) {
      console.error('Error signing out:', error);
      clearAuthStorage();
      updateAuthState(null, null);
    }
  }, [updateAuthState]);

  return { refreshSession, logout };
};

const useAuthInitialization = (
  updateAuthState: (session: Session | null, user: User | null) => void,
  setLoading: (loading: boolean) => void,
) =>
  useCallback(async () => {
    try {
      const storedSession = getStoredSession();
      const storedUser = getStoredUser();

      if (storedSession && storedUser) {
        const MILLISECONDS_TO_SECONDS = 1000;
        const now = Math.round(Date.now() / MILLISECONDS_TO_SECONDS);
        if (storedSession.expires_at && storedSession.expires_at > now) {
          await supabase.auth.setSession(storedSession);
          updateAuthState(storedSession, storedUser);
          setLoading(false);
          return;
        }
      }

      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        clearAuthStorage();
        updateAuthState(null, null);
      } else if (currentSession) {
        updateAuthState(currentSession, currentSession.user);
      } else {
        clearAuthStorage();
        updateAuthState(null, null);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      clearAuthStorage();
      updateAuthState(null, null);
    } finally {
      setLoading(false);
    }
  }, [updateAuthState, setLoading]);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, session, loading, setLoading, updateAuthState } =
    useAuthStateHandling();
  const { refreshSession, logout } = useAuthActions(updateAuthState);
  const initializeAuth = useAuthInitialization(updateAuthState, setLoading);

  useEffect(() => {
    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // eslint-disable-next-line no-console
      console.log('Auth state changed:', event, currentSession?.user?.email);

      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          if (currentSession) {
            updateAuthState(currentSession, currentSession.user);
          }
          break;
        case 'SIGNED_OUT':
          clearAuthStorage();
          updateAuthState(null, null);
          break;
        case 'PASSWORD_RECOVERY':
          break;
        case 'USER_UPDATED':
          if (currentSession) {
            updateAuthState(currentSession, currentSession.user);
          }
          break;
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, updateAuthState, setLoading]);

  const values = useMemo(
    () => ({
      user,
      session,
      isAuthenticated: !!session && !!user,
      loading,
      ready: !loading,
      logout,
      refreshSession,
    }),
    [user, session, loading, logout, refreshSession],
  );

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
