import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { FontSize, Radius, Shadow, Spacing } from '@/theme';

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
    <View style={[styles.container, Shadow.card, { backgroundColor: theme.surface }]}>
      <Ionicons name="search" size={18} color={theme.textMuted} />
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
          <Ionicons name="close-circle" size={18} color={theme.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    padding: 0,
  },
  clear: {
    padding: 2,
  },
});
