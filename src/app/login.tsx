import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoffeeHero } from '@/components/coffee-hero';
import { FormField } from '@/components/form-field';
import { SocialButton } from '@/components/social-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/theme';

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

  return (
    <ThemedView type="primarySoft" style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.hero}>
          <CoffeeHero variant="pour" style={StyleSheet.absoluteFill} />
        </View>

        <ScrollView
          style={[styles.sheet, { backgroundColor: theme.surface }]}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.title}>Acessar sua conta</ThemedText>

          {error ? (
            <ThemedText style={[styles.error, { color: theme.danger }]}>{error}</ThemedText>
          ) : null}

          <SocialButton
            kind="google"
            label="Continuar com Google"
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <ThemedText style={[styles.dividerLabel, { color: theme.textMuted }]}>ou</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <FormField
            label="E-mail"
            placeholder="seu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
            editable={!isSigningIn}
          />
          <FormField
            label="Senha"
            placeholder="••••••••"
            password
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
              Shadow.card,
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
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView edges={['top']} style={styles.backWrap} pointerEvents="box-none">
        {router.canGoBack() ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              Shadow.card,
              { backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </Pressable>
        ) : null}
      </SafeAreaView>
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
  hero: {
    height: 300,
  },
  sheet: {
    flex: 1,
    marginTop: -Radius.xxl,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
  },
  sheetContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    lineHeight: 30,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.4,
  },
  error: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerLabel: {
    fontSize: FontSize.sm,
  },
  primaryButton: {
    height: 54,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
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
  backWrap: {
    position: 'absolute',
    top: 0,
    left: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
});
