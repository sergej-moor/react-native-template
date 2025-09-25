# Supabase Authentication Setup

This document explains how to set up and use Supabase authentication in your React Native app.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings

## Environment Configuration

1. Copy the environment variables to your `.env` files:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

2. Add these to all your environment files:
   - `.env.development`
   - `.env.staging`
   - `.env.production`

## Authentication Features

The implementation provides the following authentication features:

### Sign Up

- Email/password registration
- Automatic email verification (configurable in Supabase)
- User metadata support (name, etc.)
- Smart email confirmation handling with user notifications
- Resend confirmation email functionality

### Sign In

- Email/password authentication
- Session management with MMKV storage
- Automatic token refresh

### Password Reset

- Email-based password reset
- Customizable redirect URL

### Password Update

- Update password for authenticated users
- Requires current session

### User Management

- Get current user information
- User metadata access
- Account deletion with double confirmation system (requires custom RPC in Supabase)

## Supabase Configuration

### Enable Email Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Enable "Email" as an authentication provider
3. Configure email templates as needed

### Email Confirmation Flow

The app automatically handles email confirmation with user-friendly notifications:

#### When Email Confirmation is Enabled (Default):

1. User signs up with email/password
2. Supabase sends confirmation email automatically
3. App shows notification: "Please check your email and click the confirmation link"
4. User is redirected to sign-in page
5. If user tries to sign in before confirming, they get a helpful error with option to resend email

#### When Email Confirmation is Disabled:

1. User signs up with email/password
2. User is immediately signed in and redirected to the app

#### Configure Email Confirmation:

- Go to Authentication > Settings in Supabase dashboard
- Toggle "Enable email confirmations" as needed
- Customize confirmation email template in Email Templates section

### Configure Email Templates (Optional)

You can customize the email templates in Authentication > Email Templates:

- Confirmation email
- Password reset email
- Magic link email

### User Metadata

The implementation supports storing additional user data in `user_metadata`:

```typescript
// During sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      name: 'John Doe',
      // other metadata
    },
  },
});
```

### Custom RPC for User Deletion (Optional)

To enable full user deletion, create this function in your Supabase SQL editor:

```sql
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
```

## Usage in Components

### Using the Auth Context

```tsx
import { useAuth } from '@/components/providers/auth';

function MyComponent() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <SignInPrompt />;
  }

  return (
    <View>
      <Text>Welcome, {user?.email}</Text>
      <Button onPress={logout} title="Sign Out" />
    </View>
  );
}
```

### Using Auth Hooks

```tsx
import { useLogin } from '@/api/auth/use-login';

function LoginComponent() {
  const { mutate: login, isPending } = useLogin({
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      showMessage({ message: error.message, type: 'danger' });
    },
  });

  const handleLogin = (formData) => {
    login({
      email: formData.email,
      password: formData.password,
    });
  };

  return <LoginForm onSubmit={handleLogin} isLoading={isPending} />;
}
```

### Resending Confirmation Emails

```tsx
import { useResendConfirmation } from '@/api/auth/use-resend-confirmation';

function ResendConfirmationButton({ userEmail }) {
  const { mutate: resendConfirmation, isPending } = useResendConfirmation({
    onSuccess: () => {
      showMessage({
        message: 'Confirmation email sent!',
        type: 'success',
      });
    },
    onError: (error) => {
      showMessage({ message: error.message, type: 'danger' });
    },
  });

  const handleResend = () => {
    resendConfirmation({ email: userEmail });
  };

  return (
    <Button
      onPress={handleResend}
      loading={isPending}
      title="Resend Confirmation Email"
    />
  );
}
```

### Account Deletion Safety

The account deletion system includes multiple safety measures to prevent accidental deletions:

```typescript
// Double confirmation system
1. First Alert: Shows warning message with consequences
2. Second Alert: Final confirmation with account email
3. Loading state: Prevents multiple deletion attempts

// Usage in your settings
import { useDeleteUser } from '@/api/auth/use-user';

function SettingsPage() {
  const { data: userData } = useUser();
  const { mutateAsync: deleteUser, isPending } = useDeleteUser({
    onSuccess: () => {
      showMessage({ message: 'Account deleted successfully', type: 'success' });
      logout();
    },
    onError: (error) => {
      showMessage({ message: error.message, type: 'danger' });
    },
  });

  const handleDeleteAccount = async () => {
    if (!userData?.email) return;
    await deleteUser({ email: userData.email });
  };

  return (
    <DeleteAccountItem
      onDelete={handleDeleteAccount}
      userEmail={userData?.email}
      isDeleting={isPending}
    />
  );
}
```

#### Confirmation Flow:

1. **First Dialog**: "_Are you sure you want to delete your account?_" with warning message
2. **Second Dialog**: "_Final Confirmation_" with account email and irreversible warning
3. **Visual Feedback**: Loading state during deletion process
4. **Success/Error Handling**: Toast messages for user feedback

## Migration from Previous Auth

If you're migrating from a previous authentication system:

1. Update your environment variables to include Supabase configuration
2. The existing auth forms and pages will continue to work without changes
3. The `useAuth` hook interface remains compatible with `isAuthenticated`, `loading`, and `logout`
4. Session management is now handled automatically by Supabase
5. Remove any custom token management code

## Security Notes

1. The anon key is safe to use in client-side code
2. Row Level Security (RLS) should be enabled on your database tables
3. User sessions are automatically managed and refreshed
4. Session data is stored securely in MMKV storage

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure you run `pnpm prebuild` after updating `.env` files
2. **Authentication not working**: Check that your Supabase URL and anon key are correct
3. **Email not sending**: Verify SMTP settings in Supabase dashboard
4. **User deletion fails**: Implement the custom RPC function or handle the error gracefully

### Debug Mode

Enable debug logging by adding this to your Supabase client configuration:

```typescript
export const supabase = createClient(Env.SUPABASE_URL, Env.SUPABASE_ANON_KEY, {
  auth: {
    debug: __DEV__, // Enable debug in development
    // ... other options
  },
});
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
