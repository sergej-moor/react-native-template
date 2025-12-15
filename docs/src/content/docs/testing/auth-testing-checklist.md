---
title: Authentication Testing Checklist
description: Comprehensive test cases for validating the authentication system
---

# Authentication Testing Checklist

This document provides an extensive list of test cases for validating the authentication system from a user perspective.

## 1. App Launch & Session Hydration

| #   | Test Case                                | Expected Result                                                   |
| --- | ---------------------------------------- | ----------------------------------------------------------------- |
| 1.1 | Fresh install - first app launch         | Splash screen shows, then onboarding appears                      |
| 1.2 | App launch with valid existing session   | Splash screen shows briefly, then home screen appears             |
| 1.3 | App launch with expired session          | Session should auto-refresh or fall back to anonymous             |
| 1.4 | App launch offline (no prior session)    | Should handle gracefully, show appropriate error or offline state |
| 1.5 | App launch offline (with cached session) | Should restore cached session and allow limited functionality     |
| 1.6 | Kill app and reopen (registered user)    | Session persists, user stays logged in                            |
| 1.7 | Kill app and reopen (guest user)         | Guest session persists, user stays in guest mode                  |

## 2. Onboarding Flow

| #   | Test Case                                | Expected Result                                |
| --- | ---------------------------------------- | ---------------------------------------------- |
| 2.1 | Navigate through all onboarding steps    | Steps 1 -> 2 -> 3 work with "Next" button      |
| 2.2 | Step indicators show correct progress    | Dots highlight current step correctly          |
| 2.3 | Tap "Create Account" on final step       | Navigates to sign-up screen                    |
| 2.4 | Tap "I have an account" on final step    | Navigates to sign-in screen                    |
| 2.5 | Tap "Continue as Guest" with internet    | Creates anonymous session, navigates to home   |
| 2.6 | Tap "Continue as Guest" without internet | Shows "No Internet Connection" alert           |
| 2.7 | Go to sign-up, then navigate back        | Returns to onboarding (isFirstTime still true) |
| 2.8 | Go to sign-in, then navigate back        | Returns to onboarding (isFirstTime still true) |

## 3. Sign Up Flow

| #   | Test Case                                     | Expected Result                                     |
| --- | --------------------------------------------- | --------------------------------------------------- |
| 3.1 | Sign up with valid email/password             | Success message, redirected to sign-in              |
| 3.2 | Sign up with invalid email format             | Form validation error shown                         |
| 3.3 | Sign up with weak password                    | Form validation error (min 6 chars or requirements) |
| 3.4 | Sign up with mismatched password confirmation | Validation error shown                              |
| 3.5 | Sign up with already registered email         | Error message from Supabase                         |
| 3.6 | Sign up with empty fields                     | Form validation prevents submission                 |
| 3.7 | Sign up while offline                         | Error message indicating network issue              |
| 3.8 | Sign up with optional name field              | Name stored in user metadata                        |
| 3.9 | Confirmation email received                   | Email arrives with valid confirmation link          |

## 4. Guest-to-Registered Conversion (Sign Up as Guest)

| #   | Test Case                                  | Expected Result                                         |
| --- | ------------------------------------------ | ------------------------------------------------------- |
| 4.1 | Guest user signs up                        | Uses `updateUser` to convert, preserves user ID         |
| 4.2 | Guest with todos signs up                  | Todos remain associated with same user after conversion |
| 4.3 | Converted user receives confirmation email | Email contains valid link                               |
| 4.4 | Converted user clicks confirmation link    | Account confirmed, can now sign in                      |
| 4.5 | Guest signs up with email already in use   | Error message shown                                     |

## 5. Sign In Flow

| #   | Test Case                                             | Expected Result                                 |
| --- | ----------------------------------------------------- | ----------------------------------------------- |
| 5.1 | Sign in with valid credentials                        | Success, navigated to home, isFirstTime = false |
| 5.2 | Sign in with wrong password                           | Error message shown                             |
| 5.3 | Sign in with non-existent email                       | Error message shown                             |
| 5.4 | Sign in with empty fields                             | Form validation prevents submission             |
| 5.5 | Sign in while offline                                 | Error message indicating network issue          |
| 5.6 | Sign in with unconfirmed email                        | "Email Not Confirmed" alert with resend option  |
| 5.7 | Tap "Resend Email" on confirmation alert              | Confirmation email resent, success message      |
| 5.8 | Sign in immediately after sign up (before confirming) | Email not confirmed error                       |

## 6. Guest User Data Warning (Sign In)

| #   | Test Case                            | Expected Result                           |
| --- | ------------------------------------ | ----------------------------------------- |
| 6.1 | Guest with todos attempts sign-in    | Warning alert about data loss appears     |
| 6.2 | Tap "Cancel" on data loss warning    | Returns to sign-in form, no action taken  |
| 6.3 | Tap "Continue & Discard" on warning  | Proceeds with login, guest data discarded |
| 6.4 | Guest with NO todos attempts sign-in | No warning, proceeds directly             |
| 6.5 | Non-guest user signs in              | No warning shown                          |

## 7. Email Confirmation Deep Link

| #   | Test Case                                   | Expected Result                                       |
| --- | ------------------------------------------- | ----------------------------------------------------- |
| 7.1 | Click confirmation link (app installed)     | App opens, session set, navigates to home             |
| 7.2 | Click confirmation link (app in background) | App resumes, processes link, navigates to home        |
| 7.3 | Click confirmation link with expired token  | Error handling (graceful failure)                     |
| 7.4 | Click confirmation link with invalid token  | Error logged, no crash                                |
| 7.5 | Click confirmation link multiple times      | First click works, subsequent ones handled gracefully |
| 7.6 | isFirstTime flag after confirmation         | Set to false                                          |

## 8. Forgot Password Flow

| #   | Test Case                                 | Expected Result                                           |
| --- | ----------------------------------------- | --------------------------------------------------------- |
| 8.1 | Request reset with valid registered email | Success message, email sent                               |
| 8.2 | Request reset with non-existent email     | Success message (security - don't reveal if email exists) |
| 8.3 | Request reset with invalid email format   | Form validation error                                     |
| 8.4 | Request reset with empty email            | Form validation prevents submission                       |
| 8.5 | Request reset while offline               | Error message shown                                       |
| 8.6 | Password reset email received             | Email contains valid reset link                           |
| 8.7 | Request multiple resets                   | All emails sent, latest link should work                  |

## 9. Password Reset Deep Link

| #   | Test Case                            | Expected Result                                |
| --- | ------------------------------------ | ---------------------------------------------- |
| 9.1 | Click reset link (app installed)     | App opens, navigates to update-password screen |
| 9.2 | Click reset link (app in background) | App resumes, navigates to update-password      |
| 9.3 | Click reset link with expired token  | Error handling, user notified                  |
| 9.4 | Click reset link already used        | Error handling, user notified                  |
| 9.5 | Token type is "recovery"             | Correctly routed to /update-password           |

## 10. Update Password Flow

| #    | Test Case                              | Expected Result                     |
| ---- | -------------------------------------- | ----------------------------------- |
| 10.1 | Update with valid matching passwords   | Success message, navigates back     |
| 10.2 | Update with short password (< 6 chars) | Validation error shown              |
| 10.3 | Update with mismatched passwords       | "Passwords must match" error        |
| 10.4 | Update with empty fields               | Form validation prevents submission |
| 10.5 | Update while offline                   | Error message shown                 |
| 10.6 | Sign in with new password after reset  | Success                             |
| 10.7 | Sign in with old password after reset  | Fails with wrong password error     |

## 11. Settings Screen - Guest User

| #    | Test Case                               | Expected Result                                             |
| ---- | --------------------------------------- | ----------------------------------------------------------- |
| 11.1 | Guest sees correct UI                   | Shows "Sign Up" and "Sign In" options, no email/name fields |
| 11.2 | Guest taps "Sign Up"                    | Navigates to sign-up screen                                 |
| 11.3 | Guest taps "Sign In"                    | Navigates to sign-in screen                                 |
| 11.4 | Guest taps "Reset App"                  | Confirmation alert appears                                  |
| 11.5 | Confirm "Reset App"                     | Signs out, isFirstTime = true, sees onboarding              |
| 11.6 | Cancel "Reset App"                      | Alert dismissed, no action                                  |
| 11.7 | No "Sign Out" or "Delete Account" shown | These options hidden for guests                             |

## 12. Settings Screen - Registered User

| #    | Test Case                       | Expected Result                           |
| ---- | ------------------------------- | ----------------------------------------- |
| 12.1 | Registered user sees correct UI | Shows name, email, password update option |
| 12.2 | Name displays correctly         | Shows user_metadata.name                  |
| 12.3 | Email displays correctly        | Shows registered email                    |
| 12.4 | Tap password/update option      | Navigates to update-password screen       |
| 12.5 | "Sign Out" option visible       | Shown in danger zone                      |
| 12.6 | "Delete Account" option visible | Shown in danger zone                      |

## 13. Sign Out Flow

| #    | Test Case                           | Expected Result                |
| ---- | ----------------------------------- | ------------------------------ |
| 13.1 | Tap "Sign Out"                      | User signed out                |
| 13.2 | isFirstTime reset after sign out    | Set to true                    |
| 13.3 | Navigation after sign out           | Redirected to onboarding       |
| 13.4 | Session cleared in storage          | No session persisted           |
| 13.5 | Can sign in with same account after | Login works normally           |
| 13.6 | Sign out while offline              | Should still clear local state |

## 14. Delete Account Flow

| #    | Test Case                              | Expected Result                                  |
| ---- | -------------------------------------- | ------------------------------------------------ |
| 14.1 | Tap "Delete Account"                   | Confirmation required (type email or confirm)    |
| 14.2 | Confirm deletion with valid input      | Account deleted, signed out, success message     |
| 14.3 | Cancel deletion                        | Alert dismissed, no action                       |
| 14.4 | Delete succeeds via RPC                | User fully deleted from Supabase                 |
| 14.5 | Delete RPC fails (function not set up) | Fallback: signs out with contact support message |
| 14.6 | Try to sign in with deleted account    | Account not found / invalid credentials          |
| 14.7 | Navigation after deletion              | Redirected to home (then onboarding)             |

## 15. Resend Confirmation Email

| #    | Test Case                                  | Expected Result                            |
| ---- | ------------------------------------------ | ------------------------------------------ |
| 15.1 | Request resend from sign-in error alert    | Confirmation email sent, success message   |
| 15.2 | Request resend for already confirmed email | Graceful handling (no error shown to user) |
| 15.3 | Request resend while offline               | Error message shown                        |
| 15.4 | New confirmation link works                | Clicking new link confirms account         |

## 16. Auth State Synchronization

| #    | Test Case                                 | Expected Result                        |
| ---- | ----------------------------------------- | -------------------------------------- |
| 16.1 | Session changes update Zustand store      | `useAuth` hook reflects current state  |
| 16.2 | `isAnonymous` flag correct for guest      | Returns true                           |
| 16.3 | `isAnonymous` flag correct for registered | Returns false                          |
| 16.4 | `status` is "idle" during hydration       | Before session resolved                |
| 16.5 | `status` is "signIn" when authenticated   | After successful login/session restore |
| 16.6 | `status` is "signOut" when logged out     | After sign out                         |
| 16.7 | `user` object available when signed in    | Contains user data                     |
| 16.8 | `session` object available when signed in | Contains tokens                        |

## 17. Deep Link Edge Cases

| #    | Test Case                              | Expected Result                   |
| ---- | -------------------------------------- | --------------------------------- |
| 17.1 | Deep link with tokens in hash fragment | Parsed correctly                  |
| 17.2 | Deep link with tokens in query params  | Fallback parsing works            |
| 17.3 | Non-auth deep link received            | Ignored by auth handler           |
| 17.4 | Malformed deep link                    | No crash, error logged            |
| 17.5 | Deep link without required tokens      | Ignored gracefully                |
| 17.6 | App opened via deep link (cold start)  | `getInitialURL` processes link    |
| 17.7 | Deep link while app running            | `addEventListener` processes link |

## 18. Network & Error Handling

| #    | Test Case                                | Expected Result               |
| ---- | ---------------------------------------- | ----------------------------- |
| 18.1 | All auth actions fail gracefully offline | User-friendly error messages  |
| 18.2 | Network timeout on sign-in               | Error message, can retry      |
| 18.3 | Network timeout on sign-up               | Error message, can retry      |
| 18.4 | Server error (500) from Supabase         | Error message shown           |
| 18.5 | Rate limiting from Supabase              | Appropriate error message     |
| 18.6 | Network recovers mid-flow                | Can retry action successfully |

## 19. Security Considerations

| #    | Test Case                       | Expected Result                   |
| ---- | ------------------------------- | --------------------------------- |
| 19.1 | Password not visible by default | Secure text entry enabled         |
| 19.2 | Session tokens not logged       | No sensitive data in console      |
| 19.3 | Session stored securely         | Using secure storage adapter      |
| 19.4 | Expired tokens handled          | Auto-refresh or re-authentication |
| 19.5 | Invalid tokens rejected         | Cannot use tampered tokens        |

## 20. Cross-Platform (iOS & Android)

| #    | Test Case                      | Expected Result                  |
| ---- | ------------------------------ | -------------------------------- |
| 20.1 | Deep links work on iOS         | Universal links or custom scheme |
| 20.2 | Deep links work on Android     | App links or custom scheme       |
| 20.3 | Keyboard handling on forms     | Inputs accessible, not covered   |
| 20.4 | Back button behavior (Android) | Appropriate navigation           |
| 20.5 | Gesture navigation (iOS)       | Swipe back works on modals       |

---

## Quick Smoke Test Sequence

For rapid validation, run through these critical paths:

1. **Fresh Install -> Guest Mode**

   - Install app -> Onboarding -> Continue as Guest -> Home

2. **Guest Sign Up**

   - Settings -> Sign Up -> Fill form -> Check email -> Confirm -> Sign In

3. **Standard Sign In**

   - Onboarding -> Sign In -> Valid credentials -> Home

4. **Password Reset**

   - Sign In -> Forgot Password -> Email -> Click link -> New password -> Sign in

5. **Sign Out Cycle**
   - Settings -> Sign Out -> Onboarding -> Sign In -> Home

---

## Test Coverage Summary

| Category               | Test Cases |
| ---------------------- | ---------- |
| App Launch & Hydration | 7          |
| Onboarding             | 8          |
| Sign Up                | 9          |
| Guest Conversion       | 5          |
| Sign In                | 8          |
| Guest Data Warning     | 5          |
| Email Confirmation     | 6          |
| Forgot Password        | 7          |
| Password Reset Link    | 5          |
| Update Password        | 7          |
| Settings (Guest)       | 7          |
| Settings (Registered)  | 6          |
| Sign Out               | 6          |
| Delete Account         | 7          |
| Resend Confirmation    | 4          |
| Auth State Sync        | 8          |
| Deep Link Edge Cases   | 7          |
| Network & Errors       | 6          |
| Security               | 5          |
| Cross-Platform         | 5          |
| **Total**              | **~118**   |
