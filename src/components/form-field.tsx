import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

type Props = TextInputProps & {
  label: string;
  password?: boolean;
};

export function FormField({ label, password, style, ...rest }: Props) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[styles.inputWrap, { backgroundColor: theme.surfaceAlt }]}>
        <TextInput
          style={[styles.input, { color: theme.text }, style]}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={password ? hidden : false}
          {...rest}
        />
        {password ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={theme.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    padding: 0,
  },
});
