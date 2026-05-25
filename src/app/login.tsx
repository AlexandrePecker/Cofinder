import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Layout, Radius, Shadow, Spacing } from '@/theme';

function BrandMark({ color, bg }: { color: string; bg: string }) {
  return (
    <View style={[styles.mark, { backgroundColor: bg }]}>
      <View style={[styles.markRing, { borderColor: color }]}>
        <View style={[styles.markDot, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.googleBadge}>
      <ThemedText style={styles.googleLetter}>G</ThemedText>
    </View>
  );
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
      const msg = (e instanceof Error ? e.message : '').toLowerCase();
      if (msg.includes('cancel') || msg.includes('dismiss') || msg.includes('abort')) {
        // user dismissed the OAuth flow — silent
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
        setError('Sem conexão. Verifique sua internet e tente novamente.');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <BrandMark color={theme.textOnPrimary} bg={theme.primary} />
          <View style={styles.heroText}>
            <ThemedText style={styles.title}>Cofinder</ThemedText>
            <ThemedText style={[styles.tagline, { color: theme.textMuted }]}>
              {'Descubra cafeterias\nbem avaliadas perto de você'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          {error ? (
            <ThemedText style={[styles.error, { color: theme.danger }]}>{error}</ThemedText>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Entrar com Google"
            disabled={isSigningIn}
            onPress={handleSignIn}
            style={({ pressed }) => [
              styles.button,
              Shadow.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                opacity: pressed || isSigningIn ? 0.75 : 1,
              },
            ]}
          >
            {isSigningIn ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <View style={styles.buttonContent}>
                <GoogleIcon />
                <ThemedText style={[styles.buttonText, { color: theme.text }]}>
                  Continuar com Google
                </ThemedText>
              </View>
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
    gap: Spacing.xl,
    paddingBottom: Spacing.xxl * 2,
  },
  heroText: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mark: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: FontSize.xxl,
    lineHeight: Math.round(FontSize.xxl * 1.2),
    fontWeight: FontWeight.bold,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    letterSpacing: 0.1,
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
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  googleBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLetter: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
