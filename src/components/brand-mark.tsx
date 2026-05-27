import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/hooks/use-theme';

export function BrandMark({ size = 44, iconColor }: { size?: number; iconColor?: string }) {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={[theme.primarySoft, theme.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="cafe" size={size * 0.5} color={iconColor ?? theme.text} />
    </LinearGradient>
  );
}
