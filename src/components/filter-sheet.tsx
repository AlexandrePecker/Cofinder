import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { type CafeFilters, type SortBy } from '@/components/filter-bar';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

interface FilterSheetProps {
  visible: boolean;
  filters: CafeFilters;
  onChange: (filters: CafeFilters) => void;
  onClose: () => void;
}

const RADIUS_OPTIONS: { label: string; value: number }[] = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: '50 km', value: 50 },
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

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: 'Relevância', value: 'default' },
  { label: 'Melhor nota', value: 'rating' },
  { label: 'Mais avaliados', value: 'reviews' },
];

export const DEFAULT_FILTERS: CafeFilters = {
  minRating: null,
  priceLevel: null,
  radiusKm: 20,
  sortBy: 'default',
};

export function activeFilterCount(filters: CafeFilters): number {
  let count = 0;
  if (filters.radiusKm !== DEFAULT_FILTERS.radiusKm) count++;
  if (filters.minRating !== null) count++;
  if (filters.priceLevel !== null) count++;
  if (filters.sortBy !== 'default') count++;
  return count;
}

function ChipGroup<T extends number | string | null>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onSelect: (v: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.group}>
      <ThemedText style={[styles.groupLabel, { color: theme.textMuted }]}>{label}</ThemedText>
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => onSelect(opt.value)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active ? theme.primary : theme.surfaceAlt,
                  borderColor: active ? theme.primary : theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  { color: active ? theme.textOnPrimary : theme.textSecondary },
                ]}
              >
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function FilterSheet({ visible, filters, onChange, onClose }: FilterSheetProps) {
  const theme = useTheme();
  const hasActive = activeFilterCount(filters) > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: theme.surface }]}>
        <View style={[styles.handle, { backgroundColor: theme.border }]} />

        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <ThemedText style={styles.title}>Filtros</ThemedText>
          {hasActive && (
            <Pressable
              onPress={() => onChange(DEFAULT_FILTERS)}
              style={({ pressed }) => [styles.clearButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <ThemedText style={[styles.clearText, { color: theme.primary }]}>Limpar</ThemedText>
            </Pressable>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ChipGroup
            label="RAIO DE BUSCA"
            options={RADIUS_OPTIONS}
            value={filters.radiusKm}
            onSelect={(v) => onChange({ ...filters, radiusKm: v as number })}
          />
          <ChipGroup
            label="NOTA MÍNIMA"
            options={RATING_OPTIONS}
            value={filters.minRating}
            onSelect={(v) => onChange({ ...filters, minRating: v as number | null })}
          />
          <ChipGroup
            label="FAIXA DE PREÇO"
            options={PRICE_OPTIONS}
            value={filters.priceLevel}
            onSelect={(v) => onChange({ ...filters, priceLevel: v as number | null })}
          />
          <ChipGroup
            label="ORDENAR POR"
            options={SORT_OPTIONS}
            value={filters.sortBy}
            onSelect={(v) => onChange({ ...filters, sortBy: v as SortBy })}
          />
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.applyButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <ThemedText style={[styles.applyText, { color: theme.textOnPrimary }]}>
              Ver resultados
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  clearButton: {
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.md,
  },
  clearText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  group: {
    gap: Spacing.sm,
  },
  groupLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  applyButton: {
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
