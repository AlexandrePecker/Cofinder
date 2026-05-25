import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/theme';

import type { Cafe } from './types';

type Props = {
  cafe: Cafe;
  onPress: () => void;
};

export function CafeCard({ cafe, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        Shadow.card,
        { backgroundColor: theme.surface, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <ThemedText style={styles.name} numberOfLines={1}>
        {cafe.name}
      </ThemedText>
      {cafe.address ? (
        <ThemedText style={[styles.address, { color: theme.textMuted }]} numberOfLines={1}>
          {cafe.address}
        </ThemedText>
      ) : null}
      {cafe.rating !== null ? (
        <View style={styles.ratingRow}>
          <ThemedText style={[styles.rating, { color: theme.rating }]}>
            ★ {cafe.rating.toFixed(1)}
          </ThemedText>
          {cafe.user_ratings_total ? (
            <ThemedText style={[styles.ratingCount, { color: theme.textMuted }]}>
              ({cafe.user_ratings_total.toLocaleString()})
            </ThemedText>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  address: {
    fontSize: FontSize.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  rating: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  ratingCount: {
    fontSize: FontSize.xs,
  },
});
