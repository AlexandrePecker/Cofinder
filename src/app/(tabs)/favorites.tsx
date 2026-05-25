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
import { FontSize, FontWeight, Spacing } from '@/theme';

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
  const { data: cafes, isLoading, error } = useFavoriteCafes();
  const { isPending: isToggling } = useToggleFavorite();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        edges={['top']}
        style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}
      >
        <ThemedText style={styles.title}>Favoritos</ThemedText>
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
          renderItem={({ item }) => (
            <CafeCard cafe={item} onPress={() => navigateToCafe(router, item)} />
          )}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
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
