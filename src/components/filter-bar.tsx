import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

export type SortBy = 'default' | 'rating' | 'reviews';

export interface CafeFilters {
  minRating: number | null;
  priceLevel: number | null;
  radiusKm: number;
  sortBy: SortBy;
}

interface FilterBarProps {
  filters: CafeFilters;
  onChange: (filters: CafeFilters) => void;
}

const RADIUS_OPTIONS: { label: string; value: number }[] = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: '50 km', value: 50 },
];

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: 'Relevância', value: 'default' },
  { label: 'Melhor nota', value: 'rating' },
  { label: 'Mais avaliados', value: 'reviews' },
];

const RATING_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Todas', value: null },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 },
];

const PRICE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Todos', value: null },
  { label: '$', value: 1 },
  { label: '$$', value: 2 },
  { label: '$$$', value: 3 },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const theme = useTheme();

  const isActive = (
    type: 'rating' | 'price' | 'radius' | 'sort',
    value: number | null | string,
  ) => {
    if (type === 'rating') return filters.minRating === value;
    if (type === 'price') return filters.priceLevel === value;
    if (type === 'radius') return filters.radiusKm === value;
    return filters.sortBy === value;
  };

  const chipStyle = (active: boolean) => [
    styles.chip,
    {
      backgroundColor: active ? theme.primary : theme.surfaceAlt,
      borderColor: active ? theme.primary : theme.border,
    },
  ];

  const chipTextStyle = (active: boolean) => [
    styles.chipText,
    { color: active ? theme.textOnPrimary : theme.textSecondary },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {RADIUS_OPTIONS.map((opt) => {
        const active = isActive('radius', opt.value);
        return (
          <Pressable
            key={`radius-${opt.value}`}
            onPress={() => onChange({ ...filters, radiusKm: opt.value })}
            style={({ pressed }) => [...chipStyle(active), { opacity: pressed ? 0.7 : 1 }]}
          >
            <ThemedText style={chipTextStyle(active)}>{opt.label}</ThemedText>
          </Pressable>
        );
      })}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {RATING_OPTIONS.map((opt) => {
        const active = isActive('rating', opt.value);
        return (
          <Pressable
            key={`rating-${opt.value}`}
            onPress={() => onChange({ ...filters, minRating: opt.value })}
            style={({ pressed }) => [...chipStyle(active), { opacity: pressed ? 0.7 : 1 }]}
          >
            <ThemedText style={chipTextStyle(active)}>{opt.label}</ThemedText>
          </Pressable>
        );
      })}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {PRICE_OPTIONS.map((opt) => {
        const active = isActive('price', opt.value);
        return (
          <Pressable
            key={`price-${opt.value}`}
            onPress={() => onChange({ ...filters, priceLevel: opt.value })}
            style={({ pressed }) => [...chipStyle(active), { opacity: pressed ? 0.7 : 1 }]}
          >
            <ThemedText style={chipTextStyle(active)}>{opt.label}</ThemedText>
          </Pressable>
        );
      })}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {SORT_OPTIONS.map((opt) => {
        const active = isActive('sort', opt.value);
        return (
          <Pressable
            key={`sort-${opt.value}`}
            onPress={() => onChange({ ...filters, sortBy: opt.value })}
            style={({ pressed }) => [...chipStyle(active), { opacity: pressed ? 0.7 : 1 }]}
          >
            <ThemedText style={chipTextStyle(active)}>{opt.label}</ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  divider: {
    width: 1,
    height: 20,
    marginHorizontal: Spacing.xs,
  },
});
