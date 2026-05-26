import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, Radius, Spacing } from '@/theme';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar cafeteria...',
}: SearchBarProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);

  const clear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
    >
      <ThemedText style={[styles.icon, { color: theme.textMuted }]}>⌕</ThemedText>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.text }]}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <Pressable
          onPress={clear}
          hitSlop={8}
          style={({ pressed }) => [styles.clear, { opacity: pressed ? 0.5 : 1 }]}
        >
          <ThemedText style={[styles.clearText, { color: theme.textMuted }]}>✕</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  icon: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md + 4,
  },
  input: {
    flex: 1,
    fontSize: FontSize.sm,
    padding: 0,
  },
  clear: {
    padding: 2,
  },
  clearText: {
    fontSize: FontSize.xs,
  },
});
