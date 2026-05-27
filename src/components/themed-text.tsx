import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps;

export function ThemedText({ style, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme.text }, styles.default, style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
});
