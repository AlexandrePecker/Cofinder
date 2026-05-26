import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme';

interface StarPickerProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}

export function StarPicker({ value, onChange, size = 32 }: StarPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          accessibilityRole="button"
          accessibilityLabel={`${star} estrela${star > 1 ? 's' : ''}`}
          onPress={() => onChange(star)}
          style={({ pressed }) => [styles.star, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ThemedText
            style={[
              styles.starText,
              {
                fontSize: size,
                lineHeight: size + 8,
                color: star <= value ? theme.rating : theme.border,
              },
            ]}
          >
            ★
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  star: {
    padding: 2,
  },
  starText: {},
});
