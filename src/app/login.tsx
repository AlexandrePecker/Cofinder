import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSignIn() {
    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha.');
      return;
    }
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (e) {
      const msg = (e instanceof Error ? e.message : '').toLowerCase();
      if (msg.includes('email not confirmed') || msg.includes('confirm')) {
        setError('Confirme seu email antes de entrar. Verifique sua caixa de entrada.');
      } else if (
        msg.includes('invalid') ||
        msg.includes('credentials') ||
        msg.includes('password')
      ) {
        setError('Email ou senha incorretos.');
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
        setError('Sem conexão. Verifique sua internet e tente novamente.');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      const msg = (e instanceof Error ? e.message : '').toLowerCase();
      if (msg.includes('cancel') || msg.includes('dismiss') || msg.includes('abort')) {
        // user dismissed — silent
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
        setError('Sem conexão. Verifique sua internet e tente novamente.');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setIsSigningIn(false);
    }
  }

  const inputBorderColor = theme.border;
  const inputBg = theme.surface;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          <View style={styles.hero}>
            <BrandMark color={theme.textOnPrimary} bg={theme.primary} />
            <View style={styles.heroText}>
              <ThemedText style={styles.title}>Cofinder</ThemedText>
              <ThemedText style={[styles.tagline, { color: theme.textMuted }]}>
                {'Avalie cafeterias e\ndescubra as favoritas da comunidade'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.form}>
            {error ? (
              <ThemedText style={[styles.error, { color: theme.danger }]}>{error}</ThemedText>
            ) : null}

            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, borderColor: inputBorderColor, color: theme.text },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              editable={!isSigningIn}
            />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, borderColor: inputBorderColor, color: theme.text },
              ]}
              placeholder="Senha"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              editable={!isSigningIn}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entrar com email"
              disabled={isSigningIn}
              onPress={handleEmailSignIn}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary, opacity: pressed || isSigningIn ? 0.75 : 1 },
              ]}
            >
              {isSigningIn ? (
                <ActivityIndicator color={theme.textOnPrimary} />
              ) : (
                <ThemedText style={[styles.primaryButtonText, { color: theme.textOnPrimary }]}>
                  Entrar
                </ThemedText>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/register')}
              style={({ pressed }) => [styles.registerLink, { opacity: pressed ? 0.6 : 1 }]}
            >
              <ThemedText style={[styles.registerText, { color: theme.textSecondary }]}>
                Não tem conta?{' '}
                <ThemedText style={[styles.registerHighlight, { color: theme.primary }]}>
                  Cadastre-se
                </ThemedText>
              </ThemedText>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <ThemedText style={[styles.dividerLabel, { color: theme.textMuted }]}>ou</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entrar com Google"
              disabled={isSigningIn}
              onPress={handleGoogleSignIn}
              style={({ pressed }) => [
                styles.googleButton,
                Shadow.card,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: pressed || isSigningIn ? 0.75 : 1,
                },
              ]}
            >
              <View style={styles.buttonContent}>
                <GoogleIcon />
                <ThemedText style={[styles.buttonText, { color: theme.text }]}>
                  Continuar com Google
                </ThemedText>
              </View>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    paddingBottom: Spacing.xl,
  },
  heroText: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mark: {
    width: 88,
    height: 88,
    borderRadius: 24,
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
  form: {
    gap: Spacing.sm,
  },
  error: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  input: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
  },
  primaryButton: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  primaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  registerText: {
    fontSize: FontSize.sm,
  },
  registerHighlight: {
    fontWeight: FontWeight.semibold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerLabel: {
    fontSize: FontSize.xs,
  },
  googleButton: {
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
