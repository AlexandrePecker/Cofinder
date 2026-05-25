import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CafeCard } from '@/features/cafes/cafe-card';
import type { Cafe } from '@/features/cafes/types';
import { useLocation } from '@/features/cafes/use-location';
import { useNearbyCafes } from '@/features/cafes/use-nearby-cafes';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Spacing } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const location = useLocation();

  const lat = location.status === 'ready' ? location.lat : null;
  const lng = location.status === 'ready' ? location.lng : null;

  const { data: cafes, isLoading, error } = useNearbyCafes(lat, lng);

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
          <View style={styles.listFeedback}>
            <ActivityIndicator />
          </View>
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
            renderItem={({ item }) => <CafeCard cafe={item} onPress={() => {}} />}
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
  },
  message: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
