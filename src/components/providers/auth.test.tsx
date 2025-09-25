import type { Session, User } from '@supabase/supabase-js';
import { act, renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { render, screen } from '@/lib/test-utils';

import {
  AuthProvider,
  clearAuthStorage,
  getStoredSession,
  getStoredUser,
  setStoredSession,
  setStoredUser,
  useAuth,
} from './auth';

const SESSION_EXPIRES_IN_SECONDS = 3600;
const MILLISECONDS_TO_SECONDS = 1000;

// Mock MMKV Storage
jest.mock('react-native-mmkv', () => {
  const mockStorage = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (key: string, value: string) => mockStorage.set(key, value),
      getString: (key: string) => mockStorage.get(key) ?? null,
      delete: (key: string) => mockStorage.delete(key),
    })),
  };
});

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    setSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
    signOut: jest.fn(),
  },
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

const TestComponent = () => {
  const { user, session, isAuthenticated, loading, ready, logout } = useAuth();
  return (
    <View>
      <Text testID="user-email">{user?.email ?? 'no-user'}</Text>
      <Text testID="has-session">{session ? 'has-session' : 'no-session'}</Text>
      <Text testID="isAuthenticated">{isAuthenticated ? 'true' : 'false'}</Text>
      <Text testID="loading">{loading ? 'true' : 'false'}</Text>
      <Text testID="ready">{ready ? 'true' : 'false'}</Text>
      <TouchableOpacity testID="logout" onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: { name: 'Test User' },
  identities: [],
  confirmation_sent_at: '2023-01-01T00:00:00Z',
  confirmed_at: '2023-01-01T00:00:00Z',
  email_confirmed_at: '2023-01-01T00:00:00Z',
};

const createMockSession = (): Session => ({
  access_token: 'access-token-123',
  refresh_token: 'refresh-token-123',
  expires_in: SESSION_EXPIRES_IN_SECONDS,
  expires_at:
    Math.floor(Date.now() / MILLISECONDS_TO_SECONDS) +
    SESSION_EXPIRES_IN_SECONDS,
  token_type: 'bearer',
  user: mockUser,
});

describe('Auth Storage Utilities', () => {
  afterEach(() => {
    clearAuthStorage();
  });

  it('stores and retrieves user correctly', () => {
    setStoredUser(mockUser);
    const retrievedUser = getStoredUser();
    expect(retrievedUser).toEqual(mockUser);
  });

  it('stores and retrieves session correctly', () => {
    const mockSession = createMockSession();
    setStoredSession(mockSession);
    const retrievedSession = getStoredSession();
    expect(retrievedSession).toEqual(mockSession);
  });

  it('clears storage correctly', () => {
    const mockSession = createMockSession();
    setStoredUser(mockUser);
    setStoredSession(mockSession);

    clearAuthStorage();

    expect(getStoredUser()).toBeNull();
    expect(getStoredSession()).toBeNull();
  });
});

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthStorage();
  });

  it('provides initial state correctly when no session exists', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.ready).toBe(true);
  });

  it('handles existing session correctly', async () => {
    const mockSession = createMockSession();
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.ready).toBe(true);
  });

  it('logs out correctly', async () => {
    const mockSession = createMockSession();
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});

describe('TestComponent - Authenticated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthStorage();
  });

  it('renders correctly with authenticated user', async () => {
    const mockSession = createMockSession();
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'test@example.com',
    );
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
  });
});

describe('TestComponent - No User', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthStorage();
  });

  it('renders correctly with no user', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });
});
