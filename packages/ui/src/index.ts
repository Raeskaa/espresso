// Shared UI components
// Note: Most UI will be platform-specific (web uses shadcn/ui, mobile uses NativeWind)
// This package contains shared design tokens and any universal components

// Design tokens - Bold/Gen-Z palette
export const colors = {
  primary: {
    DEFAULT: '#7C3AED', // Electric purple
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  secondary: {
    DEFAULT: '#00D9FF', // Cyan pop
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#00D9FF',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  accent: {
    DEFAULT: '#FFE500', // Yellow highlight
    orange: '#FF5722',
    pink: '#EC4899',
  },
  background: {
    dark: '#0A0A0A',
    light: '#FAFAFA',
  },
} as const;

// Typography
export const typography = {
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    accent: 'Space Grotesk, system-ui, sans-serif',
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
} as const;

// Spacing
export const spacing = {
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
} as const;

// Export all
export const theme = {
  colors,
  typography,
  spacing,
} as const;
