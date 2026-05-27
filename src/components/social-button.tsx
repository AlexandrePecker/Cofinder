import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

// Brand colors — fixed by the provider, not part of the themeable palette.
const BRAND = {
  google: '#EA4335',
  facebook: '#1877F2',
} as const;

type Kind = keyof typeof BRAND;

const ICON: Record<Kind, React.ComponentProps<typeof Ionicons>['name']> = {
  google: 'logo-google',
  facebook: 'logo-facebook',
};

export function SocialButton({
  kind,
  label,
  onPress,
  disabled,
}: {
  kind: Kind;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.surfaceAlt,
          borderColor: theme.border,
          opacity: pressed || disabled ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={ICON[kind]} size={20} color={BRAND[kind]} />
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 50,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
