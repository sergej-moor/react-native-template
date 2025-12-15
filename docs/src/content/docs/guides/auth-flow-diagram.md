---
title: Authentication Flow Diagram
description: Visual representation of the authentication system user flows
---

# Authentication Flow Diagram

This Mermaid diagram documents the complete authentication system as implemented in the app.

## Overview

The authentication system supports:

- **Anonymous (Guest) Sessions** - Automatic soft login for first-time users
- **Email/Password Authentication** - Standard registration and login
- **Guest-to-Registered Conversion** - Preserves user data when upgrading from guest
- **Email Confirmation** - Required for new accounts
- **Password Reset** - Email-based recovery flow
- **Deep Link Handling** - For email verification and password reset callbacks

## Complete Flow Diagram

```mermaid
flowchart TB
    subgraph AppLaunch["App Launch"]
        START([App Opens]) --> HYDRATE[hydrateAuth]
        HYDRATE --> CHECK_SESSION{Existing Session?}
        CHECK_SESSION -->|Yes| RESTORE[Restore Session]
        CHECK_SESSION -->|No| ANON_LOGIN[signInAnonymously]
        ANON_LOGIN -->|Success| SET_ANON_SESSION[Set Anonymous Session]
        ANON_LOGIN -->|Error| SET_NULL[Set Session to Null]
        RESTORE --> UPDATE_STORE[Update Zustand Store]
        SET_ANON_SESSION --> UPDATE_STORE
        SET_NULL --> UPDATE_STORE
        UPDATE_STORE --> HIDE_SPLASH[Hide Splash Screen]
    end

    subgraph Routing["Route Guard"]
        HIDE_SPLASH --> CHECK_FIRST{isFirstTime?}
        CHECK_FIRST -->|Yes| ONBOARD["/onboarding"]
        CHECK_FIRST -->|No| HOME["/(app)"]
    end

    subgraph Onboarding["Onboarding Flow"]
        ONBOARD --> STEP1[Step 1: Welcome]
        STEP1 --> STEP2[Step 2: Features]
        STEP2 --> STEP3[Step 3: Auth Choice]
        STEP3 --> CREATE_BTN{User Choice}
        CREATE_BTN -->|Create Account| GO_SIGNUP["/sign-up"]
        CREATE_BTN -->|I have an account| GO_SIGNIN["/sign-in"]
        CREATE_BTN -->|Continue as Guest| GUEST_MODE[Check Network]
        GUEST_MODE -->|Connected| CALL_HYDRATE[hydrateAuth]
        GUEST_MODE -->|No Connection| NET_ERROR[Show Error Alert]
        CALL_HYDRATE --> SET_NOT_FIRST[isFirstTime = false]
        SET_NOT_FIRST --> HOME
    end

    subgraph SignUp["Sign Up Flow"]
        GO_SIGNUP --> SIGNUP_FORM[Sign Up Form]
        SIGNUP_FORM --> SUBMIT_SIGNUP[Submit]
        SUBMIT_SIGNUP --> CHECK_ANON{Is Anonymous User?}
        CHECK_ANON -->|Yes| UPDATE_USER[updateUser - Convert Guest]
        CHECK_ANON -->|No| NEW_SIGNUP[signUp - Create New User]
        UPDATE_USER --> SEND_CONFIRM[Email Confirmation Sent]
        NEW_SIGNUP --> SEND_CONFIRM
        SEND_CONFIRM --> SHOW_MSG[Show Success Message]
        SHOW_MSG --> REDIRECT_SIGNIN["/sign-in"]
    end

    subgraph SignIn["Sign In Flow"]
        GO_SIGNIN --> SIGNIN_FORM[Sign In Form]
        SIGNIN_FORM --> SUBMIT_LOGIN[Submit]
        SUBMIT_LOGIN --> CHECK_HAS_TODOS{Anonymous + Has Todos?}
        CHECK_HAS_TODOS -->|Yes| DATA_WARNING[Show Data Loss Warning]
        CHECK_HAS_TODOS -->|No| DO_LOGIN[signInWithPassword]
        DATA_WARNING -->|Cancel| SIGNIN_FORM
        DATA_WARNING -->|Continue| DO_LOGIN
        DO_LOGIN -->|Success| LOGIN_SUCCESS[isFirstTime = false]
        LOGIN_SUCCESS --> HOME
        DO_LOGIN -->|Email Not Confirmed| EMAIL_NOT_CONFIRMED[Show Confirmation Alert]
        EMAIL_NOT_CONFIRMED -->|OK| SIGNIN_FORM
        EMAIL_NOT_CONFIRMED -->|Resend| RESEND[resendConfirmation]
        RESEND --> SIGNIN_FORM
        DO_LOGIN -->|Other Error| SHOW_ERROR[Show Error Message]
        SHOW_ERROR --> SIGNIN_FORM
    end

    subgraph ForgotPassword["Forgot Password Flow"]
        SIGNIN_FORM -.->|Forgot Password Link| FORGOT["/forgot-password"]
        FORGOT --> FORGOT_FORM[Enter Email]
        FORGOT_FORM --> SEND_RESET[resetPasswordForEmail]
        SEND_RESET --> RESET_EMAIL[Password Reset Email Sent]
        RESET_EMAIL --> CLICK_RESET_LINK[User Clicks Email Link]
    end

    subgraph DeepLink["Deep Link Handler"]
        direction TB
        CLICK_RESET_LINK --> DL_RECEIVE[App Receives Deep Link]
        CLICK_CONFIRM[User Clicks Confirmation Email] --> DL_RECEIVE
        DL_RECEIVE --> PARSE_URL{Parse URL Tokens}
        PARSE_URL -->|Hash Fragment| EXTRACT_HASH[Extract from Hash]
        PARSE_URL -->|Query Params| EXTRACT_QUERY[Extract from Query]
        EXTRACT_HASH --> SET_SESSION[setSession]
        EXTRACT_QUERY --> SET_SESSION
        SET_SESSION -->|Success| CHECK_TYPE{Token Type?}
        CHECK_TYPE -->|recovery| UPDATE_PW["/update-password"]
        CHECK_TYPE -->|other| HOME
        SET_SESSION -->|Error| DL_ERROR[Log Error]
    end

    subgraph UpdatePassword["Update Password Flow"]
        UPDATE_PW --> PW_FORM[Enter New Password]
        PW_FORM --> SUBMIT_PW[Submit]
        SUBMIT_PW --> UPDATE_PW_API[updateUser - password only]
        UPDATE_PW_API -->|Success| PW_SUCCESS[Show Success]
        PW_SUCCESS --> GO_BACK[Navigate Back]
        UPDATE_PW_API -->|Error| PW_ERROR[Show Error]
        PW_ERROR --> PW_FORM
    end

    subgraph Settings["Settings - Auth Actions"]
        HOME -.->|Settings| SETTINGS["/settings"]
        SETTINGS --> CHECK_GUEST{Is Guest?}

        CHECK_GUEST -->|Yes| GUEST_OPTIONS[Guest Options]
        GUEST_OPTIONS -->|Sign Up| GO_SIGNUP
        GUEST_OPTIONS -->|Sign In| GO_SIGNIN
        GUEST_OPTIONS -->|Reset App| RESET_CONFIRM[Confirm Reset]
        RESET_CONFIRM --> SIGN_OUT_RESET[signOut]

        CHECK_GUEST -->|No| USER_OPTIONS[User Options]
        USER_OPTIONS -->|Update Password| UPDATE_PW
        USER_OPTIONS -->|Sign Out| SIGN_OUT[signOut]
        USER_OPTIONS -->|Delete Account| DELETE_CONFIRM[Confirm Delete]
        DELETE_CONFIRM --> DELETE_USER[deleteUser RPC]
        DELETE_USER -->|Success| SIGN_OUT
        DELETE_USER -->|Error| FALLBACK_SIGNOUT[Fallback signOut]
    end

    subgraph SignOut["Sign Out Flow"]
        SIGN_OUT --> CALL_SIGNOUT[authService.signOut]
        SIGN_OUT_RESET --> CALL_SIGNOUT
        FALLBACK_SIGNOUT --> CALL_SIGNOUT
        CALL_SIGNOUT --> RESET_FIRST[isFirstTime = true]
        RESET_FIRST --> CLEAR_SESSION[Clear Session in Store]
        CLEAR_SESSION --> ONBOARD
    end

    subgraph AuthStateSync["Auth State Synchronization"]
        direction LR
        SUPABASE[(Supabase Auth)] -->|onAuthStateChange| LISTENER[Auth State Listener]
        LISTENER --> ZUSTAND[(Zustand Store)]
        ZUSTAND -->|session| SESSION_DATA[session]
        ZUSTAND -->|user| USER_DATA[user]
        ZUSTAND -->|isAnonymous| ANON_FLAG[isAnonymous]
        ZUSTAND -->|status| STATUS[idle/signIn/signOut]
    end

    %% Email flows (external)
    NEW_SIGNUP -.->|Email| CLICK_CONFIRM
    UPDATE_USER -.->|Email| CLICK_CONFIRM

    %% Styling
    classDef startEnd fill:#e1f5fe,stroke:#01579b
    classDef decision fill:#fff3e0,stroke:#e65100
    classDef action fill:#f3e5f5,stroke:#7b1fa2
    classDef screen fill:#e8f5e9,stroke:#2e7d32
    classDef external fill:#fce4ec,stroke:#c2185b
    classDef store fill:#fffde7,stroke:#f9a825

    class START,HIDE_SPLASH startEnd
    class CHECK_SESSION,CHECK_FIRST,CREATE_BTN,CHECK_ANON,CHECK_HAS_TODOS,PARSE_URL,CHECK_TYPE,CHECK_GUEST decision
    class HYDRATE,RESTORE,ANON_LOGIN,SET_ANON_SESSION,SET_NULL,UPDATE_STORE,SET_NOT_FIRST,UPDATE_USER,NEW_SIGNUP,DO_LOGIN,SEND_RESET,SET_SESSION,UPDATE_PW_API,SIGN_OUT,DELETE_USER,CALL_SIGNOUT,RESET_FIRST,CLEAR_SESSION action
    class ONBOARD,HOME,GO_SIGNUP,GO_SIGNIN,SIGNUP_FORM,SIGNIN_FORM,FORGOT,UPDATE_PW,PW_FORM,SETTINGS screen
    class SEND_CONFIRM,RESET_EMAIL,CLICK_RESET_LINK,CLICK_CONFIRM,SUPABASE external
    class ZUSTAND,SESSION_DATA,USER_DATA,ANON_FLAG,STATUS store
```

## Key Components

### Auth Service (`src/lib/auth/auth-service.ts`)

Wraps Supabase auth methods with consistent `{ data, error }` return shape.

### Auth State (`src/lib/auth/index.tsx`)

Zustand store that maintains:

- `session` - Current Supabase session
- `user` - Current user object
- `isAnonymous` - Whether user is in guest mode
- `status` - `idle` | `signIn` | `signOut`

### Deep Link Handler (`src/lib/hooks/use-auth-deep-link.ts`)

Handles incoming auth callbacks from:

- Email confirmation links
- Password reset links

### API Hooks (`src/api/auth/`)

React Query mutations for each auth operation:

- `useLogin`
- `useSignUp`
- `useForgotPassword`
- `useUpdatePassword`
- `useDeleteUser`
- `useResendConfirmation`
