/* eslint-disable no-undef, no-console */
/**
 * Email Template Builder
 *
 * Generates HTML email templates from the configuration.
 * Run: node build.js
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

const { colors, button, card, typography, logo } = config;

// Helper to generate the base HTML wrapper
function baseTemplate(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: ${typography.fontFamily};
      background-color: ${colors.background};
      -webkit-font-smoothing: antialiased;
    }
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: ${colors.dark.background} !important; }
      .email-card { background-color: ${colors.dark.cardBackground} !important; }
      .text-primary { color: ${colors.dark.textPrimary} !important; }
      .text-secondary { color: ${colors.dark.textSecondary} !important; }
      .text-muted { color: ${colors.dark.textMuted} !important; }
      .divider { border-color: ${colors.dark.border} !important; }
      .info-box { background-color: #2E2E2E !important; }
    }
  </style>
</head>
<body class="email-body" style="margin: 0; padding: 0; background-color: ${colors.background};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-body" style="background-color: ${colors.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: ${card.maxWidth};">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="width: ${logo.size}; height: ${logo.size}; background-color: ${logo.backgroundColor}; border-radius: ${logo.borderRadius}; text-align: center; vertical-align: middle;">
                    <span style="font-size: 24px; font-weight: 700; color: ${logo.textColor};">${logo.text}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-card" style="background-color: ${colors.cardBackground}; border-radius: ${card.borderRadius};">
                <tr>
                  <td style="padding: ${card.padding};">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Reusable button component
function buttonComponent(text, href) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding: 24px 0;">
                          <a href="${href}" style="display: inline-block; padding: ${button.padding}; background-color: ${button.backgroundColor}; color: ${button.textColor}; text-decoration: none; font-weight: ${button.fontWeight}; font-size: ${button.fontSize}; border-radius: ${button.borderRadius};">
                            ${text}
                          </a>
                        </td>
                      </tr>
                    </table>`;
}

// Reusable fallback link
function fallbackLink(href) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-top: 20px; border-top: 1px solid ${colors.border};" class="divider">
                          <p class="text-muted" style="margin: 16px 0 8px 0; font-size: ${typography.smallSize}; color: ${colors.textMuted}; text-align: center;">
                            Or copy this link:
                          </p>
                          <p style="margin: 0; font-size: 12px; color: ${colors.primary}; text-align: center; word-break: break-all;">
                            ${href}
                          </p>
                        </td>
                      </tr>
                    </table>`;
}

// Reusable footer
function footer(expiryText, ignoreText) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-top: 24px;">
                          <p class="text-muted" style="margin: 0 0 4px 0; font-size: ${typography.smallSize}; color: ${colors.textMuted}; text-align: center;">
                            ${expiryText}
                          </p>
                          <p class="text-muted" style="margin: 0; font-size: ${typography.smallSize}; color: ${colors.textMuted}; text-align: center;">
                            ${ignoreText}
                          </p>
                        </td>
                      </tr>
                    </table>`;
}

// Template definitions
const templates = {
  'confirm-signup': {
    title: 'Confirm Your Email',
    content: `<h1 class="text-primary" style="margin: 0 0 8px 0; font-size: ${typography.headingSize}; font-weight: 600; color: ${colors.textPrimary}; text-align: center;">
                      Confirm your email
                    </h1>
                    <p class="text-secondary" style="margin: 0; font-size: ${typography.bodySize}; color: ${colors.textSecondary}; text-align: center; line-height: 1.6;">
                      Thanks for signing up. Click the button below to verify your email address.
                    </p>
                    ${buttonComponent('Confirm Email', '{{ .ConfirmationURL }}')}
                    ${fallbackLink('{{ .ConfirmationURL }}')}
                    ${footer('This link expires in 24 hours.', "Didn't create an account? Ignore this email.")}`,
  },

  'invite-user': {
    title: "You're Invited",
    content: `<h1 class="text-primary" style="margin: 0 0 8px 0; font-size: ${typography.headingSize}; font-weight: 600; color: ${colors.textPrimary}; text-align: center;">
                      You've been invited
                    </h1>
                    <p class="text-secondary" style="margin: 0 0 16px 0; font-size: ${typography.bodySize}; color: ${colors.textSecondary}; text-align: center; line-height: 1.6;">
                      You've been invited to join:
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td class="info-box" style="background-color: #FAFAFA; border-radius: 8px; padding: 12px 16px; text-align: center;">
                          <p class="text-primary" style="margin: 0; font-size: ${typography.bodySize}; font-weight: 500; color: ${colors.textPrimary};">
                            {{ .SiteURL }}
                          </p>
                        </td>
                      </tr>
                    </table>
                    ${buttonComponent('Accept Invitation', '{{ .ConfirmationURL }}')}
                    ${fallbackLink('{{ .ConfirmationURL }}')}
                    ${footer('This invitation expires in 7 days.', "Wasn't expecting this? Ignore this email.")}`,
  },

  'magic-link': {
    title: 'Sign In',
    content: `<h1 class="text-primary" style="margin: 0 0 8px 0; font-size: ${typography.headingSize}; font-weight: 600; color: ${colors.textPrimary}; text-align: center;">
                      Sign in to your account
                    </h1>
                    <p class="text-secondary" style="margin: 0; font-size: ${typography.bodySize}; color: ${colors.textSecondary}; text-align: center; line-height: 1.6;">
                      Click below to sign in. No password needed.
                    </p>
                    ${buttonComponent('Sign In', '{{ .ConfirmationURL }}')}
                    ${fallbackLink('{{ .ConfirmationURL }}')}
                    ${footer('This link expires in 1 hour.', "Didn't request this? Ignore this email.")}`,
  },

  'change-email': {
    title: 'Confirm Email Change',
    content: `<h1 class="text-primary" style="margin: 0 0 8px 0; font-size: ${typography.headingSize}; font-weight: 600; color: ${colors.textPrimary}; text-align: center;">
                      Confirm your new email
                    </h1>
                    <p class="text-secondary" style="margin: 0 0 20px 0; font-size: ${typography.bodySize}; color: ${colors.textSecondary}; text-align: center; line-height: 1.6;">
                      You requested to change your email address.
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td class="info-box" style="background-color: #FAFAFA; border-radius: 8px; padding: 16px;">
                          <p class="text-muted" style="margin: 0 0 4px 0; font-size: 12px; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
                          <p class="text-secondary" style="margin: 0 0 12px 0; font-size: 14px; color: ${colors.textSecondary};">{{ .Email }}</p>
                          <p class="text-muted" style="margin: 0 0 4px 0; font-size: 12px; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">To</p>
                          <p class="text-primary" style="margin: 0; font-size: 14px; font-weight: 500; color: ${colors.textPrimary};">{{ .NewEmail }}</p>
                        </td>
                      </tr>
                    </table>
                    ${buttonComponent('Confirm Change', '{{ .ConfirmationURL }}')}
                    ${fallbackLink('{{ .ConfirmationURL }}')}
                    ${footer('This link expires in 24 hours.', "Didn't request this? Secure your account immediately.")}`,
  },

  'reset-password': {
    title: 'Reset Password',
    content: `<h1 class="text-primary" style="margin: 0 0 8px 0; font-size: ${typography.headingSize}; font-weight: 600; color: ${colors.textPrimary}; text-align: center;">
                      Reset your password
                    </h1>
                    <p class="text-secondary" style="margin: 0; font-size: ${typography.bodySize}; color: ${colors.textSecondary}; text-align: center; line-height: 1.6;">
                      Click below to set a new password for your account.
                    </p>
                    ${buttonComponent('Reset Password', '{{ .ConfirmationURL }}')}
                    ${fallbackLink('{{ .ConfirmationURL }}')}
                    ${footer('This link expires in 1 hour.', "Didn't request this? Your password is still safe.")}`,
  },

  reauthentication: {
    title: 'Verification Code',
    content: `<h1 class="text-primary" style="margin: 0 0 8px 0; font-size: ${typography.headingSize}; font-weight: 600; color: ${colors.textPrimary}; text-align: center;">
                      Your verification code
                    </h1>
                    <p class="text-secondary" style="margin: 0 0 24px 0; font-size: ${typography.bodySize}; color: ${colors.textSecondary}; text-align: center; line-height: 1.6;">
                      Enter this code to verify your identity.
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td class="info-box" style="background-color: #FAFAFA; border-radius: 8px; padding: 20px 32px; text-align: center;">
                                <p style="margin: 0; font-size: 32px; font-weight: 700; color: ${colors.primary}; letter-spacing: 6px; font-family: 'SF Mono', Monaco, 'Courier New', monospace;">
                                  {{ .Token }}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p class="text-muted" style="margin: 24px 0 0 0; font-size: ${typography.smallSize}; color: ${colors.textMuted}; text-align: center;">
                      Never share this code with anyone.
                    </p>
                    ${footer('This code expires in 10 minutes.', "Didn't request this? Change your password now.")}`,
  },
};

// Build all templates
function build() {
  const distDir = path.join(__dirname, 'dist');

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Generate each template
  for (const [name, template] of Object.entries(templates)) {
    const html = baseTemplate(template.title, template.content);
    const outputPath = path.join(distDir, `${name}.html`);
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`Generated: ${name}.html`);
  }

  console.log(
    `\nDone! ${Object.keys(templates).length} templates generated in /dist`,
  );
}

build();
