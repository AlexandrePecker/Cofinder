import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Layout, Radius, Spacing } from '@/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao entrar. Tente novamente.');
    } finally {
      setIsSigningIn(false);
    }
  }

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

        <View style={styles.footer}>
          {error ? (
            <ThemedText style={[styles.error, { color: theme.danger }]}>{error}</ThemedText>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={isSigningIn}
            onPress={handleSignIn}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.primary, opacity: pressed || isSigningIn ? 0.85 : 1 },
            ]}
          >
            {isSigningIn ? (
              <ActivityIndicator color={theme.textOnPrimary} />
            ) : (
              <ThemedText style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                Continuar com Google
              </ThemedText>
            )}
          </Pressable>
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
    paddingVertical: Spacing.xxl,
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
    fontSize: 32,
    lineHeight: 38,
    fontWeight: FontWeight.bold,
  },
  title: {
    fontSize: FontSize.xxl,
    lineHeight: Math.round(FontSize.xxl * 1.2),
    fontWeight: FontWeight.bold,
  },
  tagline: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  footer: {
    gap: Spacing.md,
  },
  error: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  button: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
