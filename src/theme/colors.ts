export const Colors = {
  light: {
    text: '#2B1810',
    textSecondary: '#5D4738',
    textMuted: '#9B8775',
    textOnPrimary: '#FFFFFF',

    background: '#F5EFE6',
    surface: '#FFFFFF',
    surfaceAlt: '#EBDFCF',
    border: '#EBE1D4',

    primary: '#C2814B',
    primaryDeep: '#A86B38',
    primarySoft: '#E7C9A8',
    primaryMuted: '#C9B8A6',
    accent: '#2F8F83',

    rating: '#E8A317',
    success: '#2C9251',
    danger: '#C03A2B',

    overlay: 'rgba(43, 24, 16, 0.35)',
  },
  dark: {
    text: '#F5EFE6',
    textSecondary: '#C4B6A8',
    textMuted: '#8C7E72',
    textOnPrimary: '#1A1411',

    background: '#1A1108',
    surface: '#241C17',
    surfaceAlt: '#2E241D',
    border: '#3A2E25',

    primary: '#D89B6A',
    primaryDeep: '#B27B45',
    primarySoft: '#8A6649',
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
