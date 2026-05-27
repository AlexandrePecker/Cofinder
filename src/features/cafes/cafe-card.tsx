import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/theme';

import type { Cafe } from './types';

type Props = {
  cafe: Cafe;
  onPress: () => void;
};

export const CafeCard = memo(function CafeCard({ cafe, onPress }: Props) {
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
      <LinearGradient
        colors={[theme.primarySoft, theme.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.thumb}
      >
        <Ionicons name="cafe" size={28} color={theme.textOnPrimary} />
      </LinearGradient>

      <View style={styles.body}>
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
            <Ionicons name="star" size={13} color={theme.rating} />
            <ThemedText style={[styles.rating, { color: theme.rating }]}>
              {cafe.rating.toFixed(1)}
            </ThemedText>
            {cafe.user_ratings_total ? (
              <ThemedText style={[styles.ratingCount, { color: theme.textMuted }]}>
                ({cafe.user_ratings_total.toLocaleString()})
              </ThemedText>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
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
    fontWeight: FontWeight.semibold,
  },
  ratingCount: {
    fontSize: FontSize.xs,
  },
});
