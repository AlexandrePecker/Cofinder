import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

// Decorative illustration shades for the placeholder coffee hero — swap for real
// photos later (see design notes). Not part of the themeable UI palette.
const ESPRESSO = '#1A1108';
const ESPRESSO_EDGE = '#1F1108';

type Variant = 'pour' | 'splash';

export function CoffeeHero({
  variant = 'pour',
  style,
}: {
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();

  if (variant === 'splash') {
    return (
      <LinearGradient
        colors={[theme.primary, theme.primaryDeep, ESPRESSO_EDGE]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.fill, style]}
      >
        <Ionicons name="cafe" size={150} color="rgba(255,255,255,0.08)" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[theme.primary, theme.primarySoft]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[styles.fill, style]}
    >
      <View style={styles.cup}>
        <Ionicons name="cafe" size={132} color={ESPRESSO} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cup: {
    position: 'absolute',
    bottom: 24,
  },
});
