/* eslint-disable max-lines-per-function */
import type { Session, User } from '@supabase/supabase-js';

// Import after mocks are set up
import { hydrateAuth, signOut, useAuth } from './index';

// Create mock functions that exist at module load time
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockSignInAnonymously = jest.fn();

jest.mock('./auth-service', () => ({
  authService: {
    signOut: () => mockSignOut(),
    getSession: () => mockGetSession(),
    signInAnonymously: () => mockSignInAnonymously(),
    // onAuthStateChange is called at module load, return a no-op unsubscribe
    onAuthStateChange: () => () => {},
  },
}));

// Mock storage
const mockStorageSet = jest.fn();
jest.mock('../storage', () => ({
  storage: {
    set: (key: string, value: unknown) => mockStorageSet(key, value),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the store state
    useAuth.getState().setSession(null);
  });

  describe('useAuth store', () => {
    it('has correct initial state after reset', () => {
      const state = useAuth.getState();

      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAnonymous).toBe(false);
      expect(state.status).toBe('signOut');
    });

    describe('setSession', () => {
      it('sets signIn status when session is provided', () => {
        const mockSession = {
          access_token: 'token',
          refresh_token: 'refresh',
          user: { id: 'user-123', email: 'test@example.com' } as User,
        } as Session;

        useAuth.getState().setSession(mockSession);

        const state = useAuth.getState();
        expect(state.status).toBe('signIn');
        expect(state.session).toBe(mockSession);
        expect(state.user).toBe(mockSession.user);
        expect(state.isAnonymous).toBe(false);
      });

      it('sets signOut status when session is null', () => {
        // First set a session
        const mockSession = {
          access_token: 'token',
          user: { id: 'user-123' } as User,
        } as Session;
        useAuth.getState().setSession(mockSession);

        // Then clear it
        useAuth.getState().setSession(null);

        const state = useAuth.getState();
        expect(state.status).toBe('signOut');
        expect(state.session).toBeNull();
        expect(state.user).toBeNull();
      });

      it('sets isAnonymous to true for anonymous users', () => {
        const mockSession = {
          access_token: 'token',
          user: { id: 'anon-123', is_anonymous: true } as User,
        } as Session;

        useAuth.getState().setSession(mockSession);

        expect(useAuth.getState().isAnonymous).toBe(true);
      });

      it('sets isAnonymous to false for regular users', () => {
        const mockSession = {
          access_token: 'token',
          user: { id: 'user-123', is_anonymous: false } as User,
        } as Session;

        useAuth.getState().setSession(mockSession);

        expect(useAuth.getState().isAnonymous).toBe(false);
      });

      it('handles session with undefined is_anonymous', () => {
        const mockSession = {
          access_token: 'token',
          user: { id: 'user-123' } as User,
        } as Session;

        useAuth.getState().setSession(mockSession);

        expect(useAuth.getState().isAnonymous).toBe(false);
      });
    });
  });

  describe('signOut', () => {
    it('calls authService.signOut and sets IS_FIRST_TIME flag', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await signOut();

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockStorageSet).toHaveBeenCalledWith('IS_FIRST_TIME', true);
    });

    it('still sets IS_FIRST_TIME flag even when signOut throws', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSignOut.mockRejectedValue(new Error('Network error'));

      await signOut();

      expect(mockStorageSet).toHaveBeenCalledWith('IS_FIRST_TIME', true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error signing out:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('hydrateAuth', () => {
    it('sets session when existing session is found', async () => {
      const mockSession = {
        access_token: 'existing-token',
        user: { id: 'user-123' } as User,
      } as Session;
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      await hydrateAuth();

      expect(mockGetSession).toHaveBeenCalled();
      expect(useAuth.getState().session).toBe(mockSession);
      expect(useAuth.getState().status).toBe('signIn');
      expect(mockSignInAnonymously).not.toHaveBeenCalled();
    });

    it('signs in anonymously when no session exists', async () => {
      const mockAnonSession = {
        access_token: 'anon-token',
        user: { id: 'anon-user', is_anonymous: true } as User,
      } as Session;
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSignInAnonymously.mockResolvedValue({
        data: { session: mockAnonSession },
        error: null,
      });

      await hydrateAuth();

      expect(mockSignInAnonymously).toHaveBeenCalled();
      expect(useAuth.getState().session).toBe(mockAnonSession);
      expect(useAuth.getState().isAnonymous).toBe(true);
    });

    it('sets null session when anonymous sign in fails', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSignInAnonymously.mockResolvedValue({
        data: null,
        error: new Error('Anonymous auth disabled'),
      });

      await hydrateAuth();

      expect(useAuth.getState().session).toBeNull();
      expect(useAuth.getState().status).toBe('signOut');
    });

    it('handles null anonData session gracefully', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSignInAnonymously.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await hydrateAuth();

      // Should not set any session when anonData.session is null
      expect(useAuth.getState().status).toBe('signOut');
    });

    it('does not call signInAnonymously if session data exists', async () => {
      const mockSession = {
        access_token: 'token',
        user: {} as User,
      } as Session;
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      await hydrateAuth();

      expect(mockSignInAnonymously).not.toHaveBeenCalled();
    });
  });

  describe('selectors', () => {
    it('provides use.status selector', () => {
      expect(typeof useAuth.use.status).toBe('function');
    });

    it('provides use.session selector', () => {
      expect(typeof useAuth.use.session).toBe('function');
    });

    it('provides use.user selector', () => {
      expect(typeof useAuth.use.user).toBe('function');
    });

    it('provides use.isAnonymous selector', () => {
      expect(typeof useAuth.use.isAnonymous).toBe('function');
    });
  });
});
