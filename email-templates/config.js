/**
 * Email Template Configuration
 *
 * Update these values to change the styling across all email templates.
 * After making changes, run: node build.js
 */

module.exports = {
  // Brand colors
  colors: {
    primary: '#FF7B1A', // Main accent color (buttons, links)
    primaryHover: '#E56100', // Button hover state (not used in email, but for reference)

    background: '#F5F5F5', // Page background
    cardBackground: '#FFFFFF', // Card/container background

    textPrimary: '#1E1E1E', // Headings and primary text
    textSecondary: '#474747', // Body text
    textMuted: '#737373', // Footer and helper text

    border: '#E5E5E5', // Dividers and borders

    // Dark mode overrides
    dark: {
      background: '#121212',
      cardBackground: '#1E1E1E',
      textPrimary: '#F0EFEE',
      textSecondary: '#B0B0B0',
      textMuted: '#7D7D7D',
      border: '#383838',
    },
  },

  // Button styling
  button: {
    backgroundColor: '#1E1E1E', // Solid color (no gradient)
    textColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: '600',
  },

  // Card styling
  card: {
    borderRadius: '12px',
    maxWidth: '480px',
    padding: '36px',
  },

  // Typography
  typography: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    headingSize: '22px',
    bodySize: '15px',
    smallSize: '13px',
  },

  // Logo placeholder (single letter or short text)
  logo: {
    text: 'O',
    size: '48px',
    backgroundColor: '#1E1E1E',
    textColor: '#FFFFFF',
    borderRadius: '12px',
  },
};
