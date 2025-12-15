# Email Templates

Professional email templates for Supabase authentication.

## Usage

### Generate Templates

```bash
cd email-templates
node build.js
```

This creates HTML files in the `/dist` folder.

### Customize

Edit `config.js` to change:

- **Colors**: Primary accent, text colors, backgrounds
- **Button**: Background color, text color, border radius, padding
- **Card**: Border radius, max width, padding
- **Typography**: Font family, sizes
- **Logo**: Text, size, colors

After editing, run `node build.js` to regenerate all templates.

### Deploy to Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Email Templates**
3. Select a template type (e.g., "Confirm signup")
4. Copy the contents of the corresponding file from `/dist`
5. Paste into the template editor
6. Save

## Templates

| File                    | Supabase Template    | Purpose                     |
| ----------------------- | -------------------- | --------------------------- |
| `confirm-signup.html`   | Confirm signup       | New user email verification |
| `invite-user.html`      | Invite user          | Team invitations            |
| `magic-link.html`       | Magic Link           | Passwordless sign-in        |
| `change-email.html`     | Change Email Address | Email change confirmation   |
| `reset-password.html`   | Reset Password       | Password reset              |
| `reauthentication.html` | Reauthentication     | OTP verification code       |

## Template Variables

Supabase provides these variables:

| Variable                 | Description                  |
| ------------------------ | ---------------------------- |
| `{{ .ConfirmationURL }}` | Action confirmation URL      |
| `{{ .Token }}`           | OTP code (reauthentication)  |
| `{{ .SiteURL }}`         | Your app's URL               |
| `{{ .Email }}`           | User's current email         |
| `{{ .NewEmail }}`        | New email (for email change) |

## Features

- Dark mode support via `prefers-color-scheme`
- Mobile responsive
- Outlook/Gmail compatible
- Minimal, clean design
- Single config file for all styling
