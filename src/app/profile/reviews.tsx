import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMyReviews, type MyReview } from '@/features/reviews/use-my-reviews';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

function ReviewItem({ review, onPress }: { review: MyReview; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.itemRow}>
        <ThemedText style={styles.itemName} numberOfLines={1}>
          {review.cafes?.name ?? review.place_id}
        </ThemedText>
        <ThemedText style={[styles.itemStars, { color: theme.rating }]}>
          {'★'.repeat(review.rating)}
          {'☆'.repeat(5 - review.rating)}
        </ThemedText>
      </View>
      {review.comment ? (
        <ThemedText style={[styles.itemComment, { color: theme.textSecondary }]} numberOfLines={2}>
          {review.comment}
        </ThemedText>
      ) : null}
      <ThemedText style={[styles.itemDate, { color: theme.textMuted }]}>
        {new Date(review.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </ThemedText>
    </Pressable>
  );
}

export default function ProfileReviewsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: reviews = [], isLoading } = useMyReviews();

  const navigateToReview = useCallback(
    (review: MyReview) => {
      if (!review.cafes) return;
      router.push({
        pathname: '/cafe/[id]',
        params: {
          id: review.place_id,
          name: review.cafes.name,
          address: review.cafes.address ?? '',
          rating: review.cafes.rating?.toString() ?? '',
          user_ratings_total: review.cafes.user_ratings_total?.toString() ?? '',
          price_level: review.cafes.price_level?.toString() ?? '',
          lat: review.cafes.lat.toString(),
          lng: review.cafes.lng.toString(),
          photo_ref: review.cafes.photo_ref ?? '',
        },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: MyReview }) => (
      <ReviewItem review={item} onPress={() => navigateToReview(item)} />
    ),
    [navigateToReview],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        edges={['top']}
        style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ThemedText style={[styles.backLabel, { color: theme.primary }]}>← Voltar</ThemedText>
        </Pressable>
        <ThemedText style={styles.title}>Minhas avaliações</ThemedText>
      </SafeAreaView>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                Nenhuma avaliação ainda.
              </ThemedText>
            </View>
          )
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  backButton: { alignSelf: 'flex-start' },
  backLabel: { fontSize: FontSize.sm },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  item: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemName: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  itemStars: {
    fontSize: FontSize.sm,
    letterSpacing: 1,
  },
  itemComment: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  itemDate: {
    fontSize: FontSize.xs,
  },
  empty: {
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
  },
});
