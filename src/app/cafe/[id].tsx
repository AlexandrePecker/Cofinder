import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoffeeHero } from '@/components/coffee-hero';
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

function QuickAction({
  icon,
  label,
  onPress,
  active,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        { backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Ionicons name={icon} size={20} color={theme.primary} />
      <ThemedText style={[styles.quickActionLabel, { color: active ? theme.primary : theme.text }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
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
  const hasCoords = !isNaN(lat) && !isNaN(lng);
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

  function handleToggleFavorite() {
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
    );
  }

  function handleRoutes() {
    if (!hasCoords) return;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
  }

  function handleShare() {
    const where = hasCoords ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : '';
    Share.share({ message: `${params.name}${where ? `\n${where}` : ''}` });
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {photoSource ? (
            <Image source={photoSource} style={styles.photo} contentFit="cover" transition={300} />
          ) : (
            <CoffeeHero variant="pour" style={styles.photo} />
          )}
          <SafeAreaView edges={['top']} style={styles.heroOverlay} pointerEvents="box-none">
            <View style={styles.headerRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.overlayButton,
                  { backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="chevron-back" size={20} color={theme.text} />
              </Pressable>

              {isTogglingFavorite ? (
                <View style={[styles.overlayButton, { backgroundColor: theme.surface }]}>
                  <ActivityIndicator size="small" />
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
                  }
                  onPress={handleToggleFavorite}
                  style={({ pressed }) => [
                    styles.overlayButton,
                    { backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Ionicons
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={20}
                    color={theme.primary}
                  />
                </Pressable>
              )}
            </View>
          </SafeAreaView>
        </View>

        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <ThemedText style={styles.name}>{params.name}</ThemedText>

          <View style={styles.metaRow}>
            {rating !== null ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={theme.rating} />
                <ThemedText style={[styles.rating, { color: theme.rating }]}>
                  {rating.toFixed(1)}
                </ThemedText>
              </View>
            ) : null}
            {ratingsTotal ? (
              <ThemedText style={[styles.metaText, { color: theme.textMuted }]}>
                {ratingsTotal.toLocaleString()} avaliações no Google
              </ThemedText>
            ) : null}
            {priceLevel !== null && PRICE_LABEL[priceLevel] ? (
              <>
                <ThemedText style={[styles.metaText, { color: theme.textMuted }]}>·</ThemedText>
                <ThemedText style={[styles.price, { color: theme.textSecondary }]}>
                  {PRICE_LABEL[priceLevel]}
                </ThemedText>
              </>
            ) : null}
          </View>

          {params.address ? (
            <ThemedText style={[styles.address, { color: theme.textSecondary }]}>
              {params.address}
            </ThemedText>
          ) : null}

          <View style={styles.quickActions}>
            {hasCoords ? (
              <QuickAction icon="navigate-outline" label="Rotas" onPress={handleRoutes} />
            ) : null}
            <QuickAction icon="share-outline" label="Compartilhar" onPress={handleShare} />
            <QuickAction
              icon={isFavorited ? 'bookmark' : 'bookmark-outline'}
              label="Salvar"
              active={isFavorited}
              onPress={handleToggleFavorite}
            />
          </View>

          {hasCoords ? (
            <MapView
              style={styles.miniMap}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              initialRegion={{
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.004,
                longitudeDelta: 0.004,
              }}
            >
              <Marker coordinate={{ latitude: lat, longitude: lng }} title={params.name} />
            </MapView>
          ) : null}

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Avaliações da comunidade</ThemedText>
            {reviews.length > 0 ? (
              <ThemedText style={[styles.avgRating, { color: theme.rating }]}>
                ★ {avgUserRating.toFixed(1)} ({reviews.length})
              </ThemedText>
            ) : null}
          </View>

          {showReviewForm ? (
            <View style={[styles.reviewForm, { backgroundColor: theme.surfaceAlt }]}>
              <ThemedText style={styles.formLabel}>Sua nota</ThemedText>
              <StarPicker value={draftRating} onChange={setDraftRating} size={36} />

              <ThemedText style={[styles.formLabel, { marginTop: Spacing.sm }]}>
                Comentário (opcional)
              </ThemedText>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="O que você achou?"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                maxLength={2000}
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
                style={[styles.reviewItem, { backgroundColor: theme.surfaceAlt }]}
              >
                <View style={styles.reviewHeader}>
                  <ThemedText style={[styles.reviewAuthor, { color: theme.text }]}>
                    {review.profiles?.display_name ?? 'Usuário'}
                  </ThemedText>
                  <ThemedText style={[styles.reviewRating, { color: theme.rating }]}>
                    {'★'.repeat(review.rating)}
                    <ThemedText style={{ color: theme.border }}>
                      {'★'.repeat(5 - review.rating)}
                    </ThemedText>
                  </ThemedText>
                </View>
                <ThemedText style={[styles.reviewDate, { color: theme.textMuted }]}>
                  {formatDate(review.created_at)}
                </ThemedText>
                {review.comment ? (
                  <ThemedText style={[styles.reviewComment, { color: theme.textSecondary }]}>
                    {review.comment}
                  </ThemedText>
                ) : null}
              </View>
            ))
          )}

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
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  heroContainer: {
    width: '100%',
    height: 300,
  },
  photo: {
    width: '100%',
    height: 300,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  overlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  sheet: {
    marginTop: -Radius.xxl,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rating: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  metaText: {
    fontSize: FontSize.sm,
  },
  price: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  address: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  quickAction: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  miniMap: {
    height: 150,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  avgRating: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  rateButton: {
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  rateButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  reviewForm: {
    borderRadius: Radius.lg,
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
    borderRadius: Radius.full,
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
    borderRadius: Radius.full,
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
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewRating: {
    fontSize: FontSize.sm,
    letterSpacing: 1,
  },
  reviewAuthor: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  reviewDate: {
    fontSize: FontSize.xs,
  },
  reviewComment: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
