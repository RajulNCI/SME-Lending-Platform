// ─── SME Lending Platform — Trust Navy Design Tokens ─────────────────────────
// Every colour, font, spacing and shadow in one place.
// Import this wherever you use styled-components.

export const theme = {
  colors: {
    // ── Primary palette ───────────────────────────────────────────────────────
    primary: {
      900: '#050F1F',
      800: '#0C2B5E', // ← main navy — headers, sidebars, buttons
      700: '#0F3674',
      600: '#1A56A0', // ← action blue — hover states
      500: '#2171C7',
      400: '#378ADD',
      300: '#85B7EB',
      200: '#B5D4F4',
      100: '#E6F1FB', // ← light blue — backgrounds, tints
      50: '#F0F7FF',
    },

    // ── Accent — green for approvals / success ────────────────────────────────
    accent: {
      600: '#0F6E56',
      500: '#1D9E75', // ← approved badge, success states
      400: '#5DCAA5',
      100: '#E1F5EE',
    },

    // ── Semantic ──────────────────────────────────────────────────────────────
    success: '#1D9E75',
    warning: '#BA7517',
    error: '#E24B4A',
    info: '#378ADD',

    // ── Neutrals ──────────────────────────────────────────────────────────────
    gray: {
      900: '#0F1117',
      800: '#1C2333',
      700: '#2D3748',
      600: '#4A5568',
      500: '#718096',
      400: '#A0AEC0',
      300: '#CBD5E0',
      200: '#E2E8F0',
      100: '#F7FAFC',
      50: '#FAFBFC',
    },

    // ── Base ──────────────────────────────────────────────────────────────────
    white: '#FFFFFF',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    borderFocus: '#378ADD',
    text: {
      primary: '#0C2B5E', // navy on white
      secondary: '#4A5568',
      muted: '#718096',
      inverse: '#FFFFFF', // white on navy
      link: '#1A56A0',
    },
  },

  // ── Typography ──────────────────────────────────────────────────────────────
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'IBM Plex Mono', 'Courier New', monospace",
  },

  fontSizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // ── Spacing (4px base grid) ──────────────────────────────────────────────────
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
  },

  // ── Border radius ────────────────────────────────────────────────────────────
  radii: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // ── Shadows ──────────────────────────────────────────────────────────────────
  shadows: {
    sm: '0 1px 3px rgba(12, 43, 94, 0.08)',
    md: '0 4px 12px rgba(12, 43, 94, 0.10)',
    lg: '0 8px 24px rgba(12, 43, 94, 0.12)',
    xl: '0 16px 48px rgba(12, 43, 94, 0.16)',
    focus: '0 0 0 3px rgba(55, 138, 221, 0.35)',
  },

  // ── Transitions ──────────────────────────────────────────────────────────────
  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '400ms ease',
  },

  // ── Breakpoints ──────────────────────────────────────────────────────────────
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ── Z-index scale ─────────────────────────────────────────────────────────────
  zIndices: {
    base: 0,
    dropdown: 10,
    modal: 100,
    toast: 200,
  },
} as const;

export type Theme = typeof theme;
export default theme;
