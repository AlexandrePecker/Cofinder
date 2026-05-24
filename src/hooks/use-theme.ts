import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/theme';

export function useTheme() {
  const scheme = useColorScheme();
  const mode = scheme === 'dark' ? 'dark' : 'light';

  return Colors[mode];
}
