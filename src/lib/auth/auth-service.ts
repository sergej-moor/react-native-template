/**
 * Auth service layer that wraps Supabase auth methods.
 * This abstraction allows for easier testing by mocking this service
 * instead of the Supabase client directly.
 */
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../supabase';

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  name?: string;
  emailRedirectTo?: string;
};

export type UpdateUserParams = {
  email?: string;
  password?: string;
  data?: Record<string, unknown>;
};

export type ResetPasswordParams = {
  email: string;
  redirectTo?: string;
};

export type AuthResult<T = void> = {
  data: T | null;
  error: Error | null;
};

export type SessionResult = AuthResult<{ session: Session | null }>;

/**
 * Authentication service that provides a testable interface to Supabase auth.
 * All methods return a consistent { data, error } shape.
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  signInWithPassword: async (params: SignInParams): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    return { data: null, error: error ? new Error(error.message) : null };
  },

  /**
   * Sign up a new user with email and password
   */
  signUp: async (
    params: SignUpParams,
  ): Promise<AuthResult<{ userId: string }>> => {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        emailRedirectTo: params.emailRedirectTo,
        data: params.name ? { name: params.name } : undefined,
      },
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data.user) {
      return {
        data: null,
        error: new Error('Sign up failed: No user returned'),
      };
    }

    return { data: { userId: data.user.id }, error: null };
  },

  /**
   * Update the current user's credentials or metadata.
   * Used for guest-to-registered conversion and password updates.
   */
  updateUser: async (
    params: UpdateUserParams,
  ): Promise<AuthResult<{ userId: string; email: string }>> => {
    const { data, error } = await supabase.auth.updateUser({
      email: params.email,
      password: params.password,
      data: params.data,
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data.user) {
      return {
        data: null,
        error: new Error('Update failed: No user returned'),
      };
    }

    return {
      data: { userId: data.user.id, email: data.user.email ?? '' },
      error: null,
    };
  },

  /**
   * Sign in anonymously (soft login / guest mode)
   */
  signInAnonymously: async (): Promise<SessionResult> => {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: { session: data.session }, error: null };
  },

  /**
   * Get the current session
   */
  getSession: async (): Promise<SessionResult> => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: { session: data.session }, error: null };
  },

  /**
   * Set a session manually (used for deep link auth)
   */
  setSession: async (
    accessToken: string,
    refreshToken: string,
  ): Promise<SessionResult> => {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: { session: data.session }, error: null };
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut();
    return { data: null, error: error ? new Error(error.message) : null };
  },

  /**
   * Send password reset email
   */
  resetPasswordForEmail: async (
    params: ResetPasswordParams,
  ): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(params.email, {
      redirectTo: params.redirectTo,
    });

    return { data: null, error: error ? new Error(error.message) : null };
  },

  /**
   * Resend confirmation email
   */
  resendConfirmation: async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    return { data: null, error: error ? new Error(error.message) : null };
  },

  /**
   * Get the current user
   */
  getUser: async (): Promise<AuthResult<{ userId: string }>> => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data.user) {
      return { data: null, error: new Error('No authenticated user found') };
    }

    return { data: { userId: data.user.id }, error: null };
  },

  /**
   * Delete user account via RPC function.
   * Requires a custom 'delete_user' function in Supabase.
   */
  deleteUser: async (): Promise<AuthResult> => {
    const { error } = await supabase.rpc('delete_user');
    return { data: null, error: error ? new Error(error.message) : null };
  },

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   */
  onAuthStateChange: (
    callback: (session: Session | null) => void,
  ): (() => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  },
};

export type AuthService = typeof authService;
