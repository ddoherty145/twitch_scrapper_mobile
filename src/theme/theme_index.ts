export const colors = {
  light: {
    primary: '#1a1a2e',
    secondary: '#6441a5',
    tertiary: '#e8e0f0',
    quaternary: '#ffffff',
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#1a1a2e',
    subtext: '#666666',
    border: '#e0e0e0',
    error: '#dc2626',
    success: '#16a34a',
  },
  dark: {
    primary: '#ffffff',
    secondary: '#9b72cf',
    tertiary: '#2d2d2d',
    quaternary: '#1a1a1a',
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    subtext: '#aaaaaa',
    border: '#333333',
    error: '#f87171',
    success: '#4ade80',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '500' as const },
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
};