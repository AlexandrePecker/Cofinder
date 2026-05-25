import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Layout, Radius, Spacing } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { session, signOut } = useAuth();

  const user = session?.user;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    'visitante';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText style={[styles.greeting, { color: theme.textSecondary }]}>
            Bem-vindo
          </ThemedText>
          <ThemedText style={styles.name}>{displayName}</ThemedText>
          <ThemedText style={[styles.hint, { color: theme.textMuted }]}>
            O mapa de cafeterias chega em breve.
          </ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={signOut}
          style={({ pressed }) => [
            styles.signOut,
            { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <ThemedText style={[styles.signOutText, { color: theme.text }]}>Sair</ThemedText>
        </Pressable>
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
    paddingVertical: Spacing.xxl,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  greeting: {
    fontSize: FontSize.md,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  hint: {
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  signOut: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
});
