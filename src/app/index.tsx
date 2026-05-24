import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Layout, Radius, Spacing } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <View style={[styles.mark, { backgroundColor: theme.primary }]}>
            <ThemedText style={[styles.markLetter, { color: theme.textOnPrimary }]}>C</ThemedText>
          </View>
          <ThemedText style={styles.title}>Cofinder</ThemedText>
          <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
            Descubra cafeterias bem avaliadas perto de você
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  mark: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markLetter: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  tagline: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
