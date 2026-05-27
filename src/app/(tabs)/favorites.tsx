import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CafeSkeletonList } from '@/components/cafe-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CafeCard } from '@/features/cafes/cafe-card';
import type { Cafe } from '@/features/cafes/types';
import { useFavoriteCafes } from '@/features/cafes/use-favorite-cafes';
import { useToggleFavorite } from '@/features/cafes/use-favorites';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

function navigateToCafe(router: ReturnType<typeof useRouter>, cafe: Cafe) {
  router.push({
    pathname: '/cafe/[id]',
    params: {
      id: cafe.place_id,
      name: cafe.name,
      address: cafe.address ?? '',
      rating: cafe.rating?.toString() ?? '',
      user_ratings_total: cafe.user_ratings_total?.toString() ?? '',
      price_level: cafe.price_level?.toString() ?? '',
      lat: cafe.lat.toString(),
      lng: cafe.lng.toString(),
    },
  });
}

export default function FavoritesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: cafes, isLoading, isFetching, error, refetch } = useFavoriteCafes();
  const { isPending: isToggling } = useToggleFavorite();

  const renderCafe = useCallback(
    ({ item }: { item: Cafe }) => (
      <View style={styles.cardWrap}>
        <CafeCard cafe={item} onPress={() => navigateToCafe(router, item)} />
        <View style={[styles.heartBadge, { backgroundColor: theme.surfaceAlt }]}>
          <Ionicons name="heart" size={16} color={theme.primary} />
        </View>
      </View>
    ),
    [router, theme],
  );

  const count = cafes?.length ?? 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <ThemedText style={styles.title}>Favoritos</ThemedText>
        {count > 0 ? (
          <ThemedText style={[styles.count, { color: theme.textMuted }]}>
            {count} {count === 1 ? 'lugar' : 'lugares'}
          </ThemedText>
        ) : null}
      </SafeAreaView>

      {isLoading ? (
        <CafeSkeletonList />
      ) : error ? (
        <View style={styles.feedback}>
          <ThemedText style={[styles.message, { color: theme.textMuted }]}>
            Não foi possível carregar os favoritos.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={cafes ?? []}
          keyExtractor={(item) => item.place_id}
          renderItem={renderCafe}
          onRefresh={refetch}
          refreshing={isFetching && !isLoading}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.feedback}>
              {isToggling ? (
                <ActivityIndicator />
              ) : (
                <ThemedText style={[styles.message, { color: theme.textMuted }]}>
                  Nenhuma cafeteria favoritada ainda.
                </ThemedText>
              )}
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.8,
  },
  count: {
    fontSize: FontSize.sm,
  },
  listContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  cardWrap: {
    position: 'relative',
  },
  heartBadge: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.xl,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  message: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
