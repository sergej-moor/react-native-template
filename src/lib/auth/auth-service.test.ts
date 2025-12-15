/* eslint-disable max-lines-per-function */
import { authService } from './auth-service';

// Mock the supabase client
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockUpdateUser = jest.fn();
const mockSignInAnonymously = jest.fn();
const mockGetSession = jest.fn();
const mockSetSession = jest.fn();
const mockSignOut = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockResend = jest.fn();
const mockGetUser = jest.fn();
const mockRpc = jest.fn();
const mockOnAuthStateChange = jest.fn();

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: Array<unknown>) =>
        mockSignInWithPassword(...args),
      signUp: (...args: Array<unknown>) => mockSignUp(...args),
      updateUser: (...args: Array<unknown>) => mockUpdateUser(...args),
      signInAnonymously: () => mockSignInAnonymously(),
      getSession: () => mockGetSession(),
      setSession: (...args: Array<unknown>) => mockSetSession(...args),
      signOut: () => mockSignOut(),
      resetPasswordForEmail: (...args: Array<unknown>) =>
        mockResetPasswordForEmail(...args),
      resend: (...args: Array<unknown>) => mockResend(...args),
      getUser: () => mockGetUser(),
      onAuthStateChange: (...args: Array<unknown>) =>
        mockOnAuthStateChange(...args),
    },
    rpc: (...args: Array<unknown>) => mockRpc(...args),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithPassword', () => {
    it('returns success when sign in succeeds', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });

      const result = await authService.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ data: null, error: null });
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('returns error when sign in fails', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

      const result = await authService.signInWithPassword({
        email: 'test@example.com',
        password: 'wrong',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('returns userId when sign up succeeds', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const result = await authService.signUp({
        email: 'new@example.com',
        password: 'password123',
        name: 'Test User',
        emailRedirectTo: 'myapp://callback',
      });

      expect(result).toEqual({ data: { userId: 'user-123' }, error: null });
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'myapp://callback',
          data: { name: 'Test User' },
        },
      });
    });

    it('returns error when sign up fails', async () => {
      mockSignUp.mockResolvedValue({
        data: {},
        error: { message: 'Email already exists' },
      });

      const result = await authService.signUp({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Email already exists');
    });

    it('returns error when no user is returned', async () => {
      mockSignUp.mockResolvedValue({ data: { user: null }, error: null });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Sign up failed: No user returned');
    });

    it('works without optional name parameter', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: 'user-456' } },
        error: null,
      });

      await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: undefined,
          data: undefined,
        },
      });
    });
  });

  describe('updateUser', () => {
    it('returns user data when update succeeds', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'updated@example.com' } },
        error: null,
      });

      const result = await authService.updateUser({
        email: 'updated@example.com',
        password: 'newpassword',
        data: { name: 'Updated Name' },
      });

      expect(result).toEqual({
        data: { userId: 'user-123', email: 'updated@example.com' },
        error: null,
      });
    });

    it('returns error when update fails', async () => {
      mockUpdateUser.mockResolvedValue({
        data: {},
        error: { message: 'Invalid password' },
      });

      const result = await authService.updateUser({ password: 'short' });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Invalid password');
    });

    it('returns error when no user is returned', async () => {
      mockUpdateUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await authService.updateUser({ password: 'newpass' });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Update failed: No user returned');
    });

    it('handles user with no email', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: null } },
        error: null,
      });

      const result = await authService.updateUser({ password: 'newpass' });

      expect(result.data).toEqual({ userId: 'user-123', email: '' });
    });
  });

  describe('signInAnonymously', () => {
    it('returns session when anonymous sign in succeeds', async () => {
      const mockSession = { access_token: 'token', user: { id: 'anon-user' } };
      mockSignInAnonymously.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authService.signInAnonymously();

      expect(result).toEqual({ data: { session: mockSession }, error: null });
    });

    it('returns error when anonymous sign in fails', async () => {
      mockSignInAnonymously.mockResolvedValue({
        data: {},
        error: { message: 'Anonymous auth disabled' },
      });

      const result = await authService.signInAnonymously();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Anonymous auth disabled');
    });
  });

  describe('getSession', () => {
    it('returns session when it exists', async () => {
      const mockSession = { access_token: 'token', user: { id: 'user-123' } };
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authService.getSession();

      expect(result).toEqual({ data: { session: mockSession }, error: null });
    });

    it('returns null session when none exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.getSession();

      expect(result).toEqual({ data: { session: null }, error: null });
    });

    it('returns error when getSession fails', async () => {
      mockGetSession.mockResolvedValue({
        data: {},
        error: { message: 'Session error' },
      });

      const result = await authService.getSession();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Session error');
    });
  });

  describe('setSession', () => {
    it('returns session when set succeeds', async () => {
      const mockSession = { access_token: 'new-token', user: { id: 'user' } };
      mockSetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authService.setSession(
        'access-token',
        'refresh-token',
      );

      expect(result).toEqual({ data: { session: mockSession }, error: null });
      expect(mockSetSession).toHaveBeenCalledWith({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
    });

    it('returns error when setSession fails', async () => {
      mockSetSession.mockResolvedValue({
        data: {},
        error: { message: 'Invalid token' },
      });

      const result = await authService.setSession('bad-token', 'bad-refresh');

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Invalid token');
    });
  });

  describe('signOut', () => {
    it('returns success when sign out succeeds', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const result = await authService.signOut();

      expect(result).toEqual({ data: null, error: null });
    });

    it('returns error when sign out fails', async () => {
      mockSignOut.mockResolvedValue({ error: { message: 'Sign out failed' } });

      const result = await authService.signOut();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Sign out failed');
    });
  });

  describe('resetPasswordForEmail', () => {
    it('returns success when reset email is sent', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null });

      const result = await authService.resetPasswordForEmail({
        email: 'test@example.com',
        redirectTo: 'https://app.com/reset',
      });

      expect(result).toEqual({ data: null, error: null });
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'https://app.com/reset' },
      );
    });

    it('returns error when reset fails', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        error: { message: 'User not found' },
      });

      const result = await authService.resetPasswordForEmail({
        email: 'unknown@example.com',
      });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('User not found');
    });
  });

  describe('resendConfirmation', () => {
    it('returns success when confirmation is resent', async () => {
      mockResend.mockResolvedValue({ error: null });

      const result = await authService.resendConfirmation('test@example.com');

      expect(result).toEqual({ data: null, error: null });
      expect(mockResend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      });
    });

    it('returns error when resend fails', async () => {
      mockResend.mockResolvedValue({ error: { message: 'Rate limited' } });

      const result = await authService.resendConfirmation('test@example.com');

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Rate limited');
    });
  });

  describe('getUser', () => {
    it('returns userId when user exists', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const result = await authService.getUser();

      expect(result).toEqual({ data: { userId: 'user-123' }, error: null });
    });

    it('returns error when getUser fails', async () => {
      mockGetUser.mockResolvedValue({
        data: {},
        error: { message: 'Not authenticated' },
      });

      const result = await authService.getUser();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Not authenticated');
    });

    it('returns error when no user is found', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await authService.getUser();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('No authenticated user found');
    });
  });

  describe('deleteUser', () => {
    it('returns success when delete succeeds', async () => {
      mockRpc.mockResolvedValue({ error: null });

      const result = await authService.deleteUser();

      expect(result).toEqual({ data: null, error: null });
      expect(mockRpc).toHaveBeenCalledWith('delete_user');
    });

    it('returns error when delete fails', async () => {
      mockRpc.mockResolvedValue({ error: { message: 'RPC not found' } });

      const result = await authService.deleteUser();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('RPC not found');
    });
  });

  describe('onAuthStateChange', () => {
    it('subscribes to auth state changes and returns unsubscribe function', () => {
      const mockUnsubscribe = jest.fn();
      mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const callback = jest.fn();
      const unsubscribe = authService.onAuthStateChange(callback);

      expect(mockOnAuthStateChange).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      // Call unsubscribe
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('calls callback when auth state changes', () => {
      type AuthCallback = (event: string, session: unknown) => void;
      let capturedCallback: AuthCallback | undefined;

      mockOnAuthStateChange.mockImplementation((cb: AuthCallback) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      const callback = jest.fn();
      authService.onAuthStateChange(callback);

      // Simulate auth state change - Supabase passes (event, session)
      const mockSession = { access_token: 'token' };
      expect(capturedCallback).toBeDefined();
      (capturedCallback as AuthCallback)('SIGNED_IN', mockSession);

      expect(callback).toHaveBeenCalledWith(mockSession);
    });
  });
});
