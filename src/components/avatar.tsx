import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { FontWeight, Radius } from '@/theme';

type Props = {
  uri?: string | null;
  name?: string | null;
  size?: number;
  onPress?: () => void;
};

function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function Avatar({ uri, name, size = 32, onPress }: Props) {
  const theme = useTheme();
  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: Radius.full,
    },
  ];

  const content = (
    <>
      <LinearGradient
        colors={[theme.primarySoft, theme.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: Radius.full }}
          contentFit="cover"
        />
      ) : (
        <ThemedText
          style={[
            styles.initials,
            { fontSize: size * 0.38, color: theme.textOnPrimary, fontWeight: FontWeight.semibold },
          ]}
        >
          {initials(name)}
        </ThemedText>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Perfil"
        onPress={onPress}
        style={({ pressed }) => [containerStyle, { opacity: pressed ? 0.75 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    lineHeight: undefined,
  },
});
