import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSnackbar } from '@/components/snackbar-provider';
import { StarPicker } from '@/components/star-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
import { useFavorites, useToggleFavorite } from '@/features/cafes/use-favorites';
import { useReviews } from '@/features/reviews/use-reviews';
import { useSubmitReview } from '@/features/reviews/use-submit-review';
import { useTheme } from '@/hooks/use-theme';
import { env } from '@/lib/env';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/theme';

const PRICE_LABEL: Record<number, string> = {
  0: 'Grátis',
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function averageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export default function CafeDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { session } = useAuth();
  const { data: favoriteIds } = useFavorites();
  const { mutate: toggleFavorite, isPending: isTogglingFavorite } = useToggleFavorite();

  const params = useLocalSearchParams<{
    id: string;
    name: string;
    address: string;
    rating: string;
    user_ratings_total: string;
    price_level: string;
    lat: string;
    lng: string;
    photo_ref: string;
  }>();

  const { data: reviews = [] } = useReviews(params.id);
  const { mutate: submitReview, isPending: isSubmitting } = useSubmitReview();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState('');

  const isFavorited = favoriteIds?.has(params.id) ?? false;
  const lat = parseFloat(params.lat);
  const lng = parseFloat(params.lng);
  const rating = params.rating ? parseFloat(params.rating) : null;
  const ratingsTotal = params.user_ratings_total ? parseInt(params.user_ratings_total, 10) : null;
  const priceLevel = params.price_level !== '' ? parseInt(params.price_level, 10) : null;

  const photoSource =
    params.photo_ref && session?.access_token
      ? {
          uri: `${env.supabaseUrl}/functions/v1/cafe-photo?photo_ref=${encodeURIComponent(params.photo_ref)}&max_width=800`,
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      : null;

  const userReview = reviews.find((r) => r.user_id === session?.user.id);
  const userRatings = reviews.map((r) => r.rating);
  const avgUserRating = averageRating(userRatings);

  function openReviewForm() {
    setDraftRating(userReview?.rating ?? 0);
    setDraftComment(userReview?.comment ?? '');
    setShowReviewForm(true);
  }

  function handleSaveReview() {
    if (!session) return;
    if (draftRating === 0) {
      showSnackbar('Selecione uma nota de 1 a 5.', 'error');
      return;
    }
    submitReview(
      {
        placeId: params.id,
        userId: session.user.id,
        rating: draftRating,
        comment: draftComment.trim() || null,
      },
      {
        onSuccess: () => {
          showSnackbar('Avaliação salva!', 'success');
          setShowReviewForm(false);
        },
        onError: () => showSnackbar('Erro ao salvar avaliação.', 'error'),
      },
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <ThemedText style={[styles.backLabel, { color: theme.primary }]}>← Voltar</ThemedText>
          </Pressable>

          {isTogglingFavorite ? (
            <ActivityIndicator size="small" />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onPress={() =>
                toggleFavorite(
                  { placeId: params.id, isFavorited },
                  {
                    onSuccess: () =>
                      showSnackbar(
                        isFavorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
                        'success',
                      ),
                    onError: () => showSnackbar('Erro ao atualizar favorito', 'error'),
                  },
                )
              }
              style={({ pressed }) => [styles.favoriteButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <ThemedText style={[styles.favoriteIcon, { color: theme.rating }]}>
                {isFavorited ? '♥' : '♡'}
              </ThemedText>
            </Pressable>
          )}
        </View>

        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {params.name}
        </ThemedText>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {photoSource ? (
          <Image source={photoSource} style={styles.photo} contentFit="cover" transition={300} />
        ) : !isNaN(lat) && !isNaN(lng) ? (
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

        {/* Cafe info */}
        <View style={[styles.card, Shadow.card, { backgroundColor: theme.surface }]}>
          <ThemedText style={styles.name}>{params.name}</ThemedText>

          {rating !== null ? (
            <View style={styles.ratingRow}>
              <ThemedText style={[styles.rating, { color: theme.rating }]}>
                ★ {rating.toFixed(1)}
              </ThemedText>
              {ratingsTotal ? (
                <ThemedText style={[styles.ratingCount, { color: theme.textMuted }]}>
                  {ratingsTotal.toLocaleString()} avaliações no Google
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

        {/* User reviews section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Avaliações da comunidade</ThemedText>
            {reviews.length > 0 ? (
              <ThemedText style={[styles.avgRating, { color: theme.rating }]}>
                ★ {avgUserRating.toFixed(1)} ({reviews.length})
              </ThemedText>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={openReviewForm}
            style={({ pressed }) => [
              styles.rateButton,
              Shadow.card,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText style={[styles.rateButtonText, { color: theme.textOnPrimary }]}>
              {userReview ? 'Editar minha avaliação' : 'Avaliar esta cafeteria'}
            </ThemedText>
          </Pressable>

          {showReviewForm ? (
            <View
              style={[
                styles.reviewForm,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <ThemedText style={styles.formLabel}>Sua nota</ThemedText>
              <StarPicker value={draftRating} onChange={setDraftRating} size={36} />

              <ThemedText style={[styles.formLabel, { marginTop: Spacing.sm }]}>
                Comentário (opcional)
              </ThemedText>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="O que você achou?"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                value={draftComment}
                onChangeText={setDraftComment}
                editable={!isSubmitting}
              />

              <View style={styles.formActions}>
                <Pressable
                  onPress={() => setShowReviewForm(false)}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    { borderColor: theme.border, opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <ThemedText style={[styles.cancelText, { color: theme.textSecondary }]}>
                    Cancelar
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleSaveReview}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.saveButton,
                    { backgroundColor: theme.primary, opacity: pressed || isSubmitting ? 0.75 : 1 },
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={theme.textOnPrimary} />
                  ) : (
                    <ThemedText style={[styles.saveText, { color: theme.textOnPrimary }]}>
                      Salvar
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          ) : null}

          {reviews.length === 0 ? (
            <ThemedText style={[styles.emptyReviews, { color: theme.textMuted }]}>
              Nenhuma avaliação ainda. Seja o primeiro!
            </ThemedText>
          ) : (
            reviews.map((review) => (
              <View
                key={review.id}
                style={[
                  styles.reviewItem,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.reviewHeader}>
                  <ThemedText style={[styles.reviewRating, { color: theme.rating }]}>
                    {'★'.repeat(review.rating)}
                    <ThemedText style={{ color: theme.border }}>
                      {'★'.repeat(5 - review.rating)}
                    </ThemedText>
                  </ThemedText>
                  <ThemedText style={[styles.reviewDate, { color: theme.textMuted }]}>
                    {formatDate(review.created_at)}
                  </ThemedText>
                </View>
                {review.comment ? (
                  <ThemedText style={[styles.reviewComment, { color: theme.textSecondary }]}>
                    {review.comment}
                  </ThemedText>
                ) : null}
              </View>
            ))
          )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: Spacing.xs,
  },
  backLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  favoriteButton: {
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.md,
  },
  favoriteIcon: {
    fontSize: FontSize.xl,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  photo: {
    width: '100%',
    height: 220,
  },
  map: {
    height: 200,
  },
  card: {
    margin: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rating: {
    fontSize: FontSize.lg,
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
  section: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  avgRating: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  rateButton: {
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  reviewForm: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  formLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  commentInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  saveButton: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  emptyReviews: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  reviewItem: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewRating: {
    fontSize: FontSize.md,
    letterSpacing: 2,
  },
  reviewDate: {
    fontSize: FontSize.xs,
  },
  reviewComment: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
