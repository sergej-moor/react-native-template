import '@testing-library/react-native/extend-expect';

// Mock the '@supabase/supabase-js' library.
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      setSession: jest.fn(),
      signOut: jest.fn(),
    },
    // Add mocks for other Supabase services if your components use them
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  })),
}));
