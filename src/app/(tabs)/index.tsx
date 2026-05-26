import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CafeSkeletonList } from '@/components/cafe-skeleton';
import { FilterBar, type CafeFilters } from '@/components/filter-bar';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CafeCard } from '@/features/cafes/cafe-card';
import type { Cafe } from '@/features/cafes/types';
import { useLocation } from '@/features/cafes/use-location';
import { useNearbyCafes } from '@/features/cafes/use-nearby-cafes';
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
      photo_ref: cafe.photo_ref ?? '',
    },
  });
}

const DEFAULT_FILTERS: CafeFilters = {
  minRating: null,
  priceLevel: null,
  radiusKm: 20,
  sortBy: 'default',
};

export default function NearbyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const location = useLocation();
  const [filters, setFilters] = useState<CafeFilters>(DEFAULT_FILTERS);
  const [query, setQuery] = useState('');

  const lat = location.status === 'ready' ? location.lat : null;
  const lng = location.status === 'ready' ? location.lng : null;

  const radiusM = filters.radiusKm * 1000;
  const { data: cafes, isLoading, isFetching, error, refetch } = useNearbyCafes(lat, lng, radiusM);

  const filtered = (cafes ?? [])
    .filter((cafe) => {
      if (filters.minRating !== null && (cafe.rating == null || cafe.rating < filters.minRating))
        return false;
      if (filters.priceLevel !== null && cafe.price_level !== filters.priceLevel) return false;
      if (query.trim() !== '' && !cafe.name.toLowerCase().includes(query.trim().toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      if (filters.sortBy === 'reviews')
        return (b.user_ratings_total ?? 0) - (a.user_ratings_total ?? 0);
      return 0;
    });

  const renderCafe = useCallback(
    ({ item }: { item: Cafe }) => (
      <CafeCard cafe={item} onPress={() => navigateToCafe(router, item)} />
    ),
    [router],
  );

  if (location.status === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
        <ThemedText style={[styles.message, { color: theme.textMuted }]}>
          Buscando sua localização...
        </ThemedText>
      </ThemedView>
    );
  }

  if (location.status === 'denied') {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
          Permissão de localização necessária para encontrar cafeterias.
        </ThemedText>
        <Pressable
          onPress={() => Linking.openSettings()}
          style={({ pressed }) => [styles.settingsButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ThemedText style={[styles.settingsLabel, { color: theme.primary }]}>
            Abrir Configurações
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        edges={['top']}
        style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}
      >
        <ThemedText style={styles.appName}>Cofinder</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textMuted }]}>
          Cafeterias num raio de {filters.radiusKm} km
        </ThemedText>
      </SafeAreaView>

      {isLoading ? (
        <CafeSkeletonList />
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={[styles.message, { color: theme.textMuted }]}>
            Não foi possível carregar as cafeterias.
          </ThemedText>
          <Pressable
            onPress={() => refetch()}
            style={({ pressed }) => [styles.settingsButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <ThemedText style={[styles.settingsLabel, { color: theme.primary }]}>
              Tentar novamente
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.searchWrapper}>
            <SearchBar value={query} onChange={setQuery} />
          </View>
          <FilterBar filters={filters} onChange={setFilters} />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.place_id}
            renderItem={renderCafe}
            onRefresh={refetch}
            refreshing={isFetching && !isLoading}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.centered}>
                <ThemedText style={[styles.message, { color: theme.textMuted }]}>
                  Nenhuma cafeteria encontrada com esses filtros.
                </ThemedText>
              </View>
            }
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  settingsButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  settingsLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  appName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.xs,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  message: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
