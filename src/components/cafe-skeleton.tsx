import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme';

function SkeletonBar({ width, height = 14 }: { width: number | `${number}%`; height?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.bar,
        { width, height, borderRadius: Radius.sm, backgroundColor: theme.surfaceAlt },
      ]}
    />
  );
}

function SkeletonCard({ opacity }: { opacity: Animated.Value }) {
  const theme = useTheme();
  return (
    <Animated.View
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, opacity }]}
    >
      <SkeletonBar width="60%" height={16} />
      <SkeletonBar width="80%" height={13} />
      <SkeletonBar width="30%" height={13} />
    </Animated.View>
  );
}

export function CafeSkeletonList() {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <View style={styles.list}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} opacity={opacity} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: Spacing.sm,
  },
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bar: {},
});
