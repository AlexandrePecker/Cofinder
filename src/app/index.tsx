import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { CafeSkeletonList } from '@/components/cafe-skeleton';
import { ProfileSheet } from '@/components/profile-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
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
    },
  });
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const lat = location.status === 'ready' ? location.lat : null;
  const lng = location.status === 'ready' ? location.lng : null;

  const { data: cafes, isLoading, error } = useNearbyCafes(lat, lng);

  const user = session?.user;
  const avatarUri =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined) ??
    null;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    null;

  if (location.status === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (location.status === 'denied') {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
          Permissão de localização necessária para encontrar cafeterias.
        </ThemedText>
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
        <Avatar uri={avatarUri} name={displayName} size={34} onPress={() => setProfileOpen(true)} />
      </SafeAreaView>

      <MapView
        style={styles.map}
        showsUserLocation
        initialRegion={{
          latitude: lat!,
          longitude: lng!,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {cafes?.map((cafe: Cafe) => (
          <Marker
            key={cafe.place_id}
            coordinate={{ latitude: cafe.lat, longitude: cafe.lng }}
            title={cafe.name}
          />
        ))}
      </MapView>

      <SafeAreaView edges={['bottom']} style={styles.list}>
        <View style={[styles.listHeader, { borderBottomColor: theme.border }]}>
          <ThemedText style={styles.listTitle}>Cafeterias próximas</ThemedText>
        </View>

        {isLoading ? (
          <CafeSkeletonList />
        ) : error ? (
          <View style={styles.listFeedback}>
            <ThemedText style={[styles.message, { color: theme.textMuted }]}>
              Não foi possível carregar as cafeterias.
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
              <View style={styles.listFeedback}>
                <ThemedText style={[styles.message, { color: theme.textMuted }]}>
                  Nenhuma cafeteria encontrada perto de você.
                </ThemedText>
              </View>
            }
          />
        )}
      </SafeAreaView>

      <ProfileSheet visible={profileOpen} onClose={() => setProfileOpen(false)} />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  map: {
    flex: 0.45,
  },
  list: {
    flex: 0.55,
  },
  listHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  listFeedback: {
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
