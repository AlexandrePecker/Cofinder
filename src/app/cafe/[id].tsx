import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/theme';

const PRICE_LABEL: Record<number, string> = {
  0: 'Grátis',
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
};

export default function CafeDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    address: string;
    rating: string;
    user_ratings_total: string;
    price_level: string;
    lat: string;
    lng: string;
  }>();

  const lat = parseFloat(params.lat);
  const lng = parseFloat(params.lng);
  const rating = params.rating ? parseFloat(params.rating) : null;
  const ratingsTotal = params.user_ratings_total ? parseInt(params.user_ratings_total, 10) : null;
  const priceLevel = params.price_level !== '' ? parseInt(params.price_level, 10) : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ThemedText style={[styles.backLabel, { color: theme.primary }]}>← Voltar</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {params.name}
        </ThemedText>
      </SafeAreaView>

      {!isNaN(lat) && !isNaN(lng) ? (
        <MapView
          style={styles.map}
          scrollEnabled={false}
          zoomEnabled={false}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker coordinate={{ latitude: lat, longitude: lng }} title={params.name} />
        </MapView>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, Shadow.card, { backgroundColor: theme.surface }]}>
          <ThemedText style={styles.name}>{params.name}</ThemedText>

          {rating !== null ? (
            <View style={styles.ratingRow}>
              <ThemedText style={[styles.rating, { color: theme.rating }]}>
                ★ {rating.toFixed(1)}
              </ThemedText>
              {ratingsTotal ? (
                <ThemedText style={[styles.ratingCount, { color: theme.textMuted }]}>
                  {ratingsTotal.toLocaleString()} avaliações
                </ThemedText>
              ) : null}
            </View>
          ) : null}

          {params.address ? (
            <ThemedText style={[styles.address, { color: theme.textSecondary }]}>
              {params.address}
            </ThemedText>
          ) : null}

          {priceLevel !== null && PRICE_LABEL[priceLevel] ? (
            <ThemedText style={[styles.price, { color: theme.textMuted }]}>
              {PRICE_LABEL[priceLevel]}
            </ThemedText>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  backLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  map: {
    height: 200,
  },
  content: {
    padding: Spacing.lg,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rating: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  ratingCount: {
    fontSize: FontSize.sm,
  },
  address: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  price: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
