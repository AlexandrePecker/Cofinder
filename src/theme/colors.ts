export const Colors = {
  light: {
    text: '#2B211A',
    textSecondary: '#6B5D52',
    textMuted: '#9A8C80',
    textOnPrimary: '#FFFFFF',

    background: '#FBF7F0',
    surface: '#FFFFFF',
    surfaceAlt: '#F2EBDF',
    border: '#E6DCCD',

    primary: '#A6724B',
    primaryMuted: '#C8A98E',
    accent: '#2F8F83',

    rating: '#E6A817',
    success: '#2E8B57',
    danger: '#C2452D',

    overlay: 'rgba(43, 33, 26, 0.45)',
  },
  dark: {
    text: '#F5EFE6',
    textSecondary: '#C4B6A8',
    textMuted: '#8C7E72',
    textOnPrimary: '#1A1411',

    background: '#1A1411',
    surface: '#241C17',
    surfaceAlt: '#2E241D',
    border: '#3A2E25',

    primary: '#D89B6A',
    primaryMuted: '#8A6649',
    accent: '#4FB3A4',

    rating: '#F2B733',
    success: '#5FB87E',
    danger: '#E0654C',

    overlay: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type ThemeMode = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
