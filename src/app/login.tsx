import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import { FontSize, FontWeight, Layout, Radius, Spacing } from '@/theme';

const TEST_USER = { email: 'teste@cofinder.dev', password: 'cofinder-test-1234' };

// Dev-only: sign in (or self-seed) a local test user so the app can be navigated
// without Google OAuth credentials. __DEV__ is false in production builds.
async function signInTestUser() {
  const { error } = await supabase.auth.signInWithPassword(TEST_USER);
  if (!error) return;
  const { error: signUpError } = await supabase.auth.signUp({
    ...TEST_USER,
    options: { data: { full_name: 'Usuário Teste' } },
  });
  if (signUpError) throw signUpError;
}

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

  async function handleTestSignIn() {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInTestUser();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no login de teste.');
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

          {__DEV__ ? (
            <Pressable
              accessibilityRole="button"
              disabled={isSigningIn}
              onPress={handleTestSignIn}
              style={({ pressed }) => [
                styles.devButton,
                { borderColor: theme.border, opacity: pressed || isSigningIn ? 0.7 : 1 },
              ]}
            >
              <ThemedText style={[styles.devButtonText, { color: theme.textSecondary }]}>
                Entrar com usuário de teste (dev)
              </ThemedText>
            </Pressable>
          ) : null}
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
  devButton: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
