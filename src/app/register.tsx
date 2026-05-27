import { Ionicons } from '@expo/vector-icons';
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
import { useRouter } from 'expo-router';

import { CoffeeHero } from '@/components/coffee-hero';
import { FormField } from '@/components/form-field';
import { SocialButton } from '@/components/social-button';
import { useSnackbar } from '@/components/snackbar-provider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await signUpWithEmail(email.trim(), password);
      showSnackbar('Verifique seu email para confirmar o cadastro.', 'success');
      router.replace('/login');
    } catch (e) {
      const msg = (e instanceof Error ? e.message : '').toLowerCase();
      if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
        setError('Este email já está cadastrado.');
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
        setError('Sem conexão. Verifique sua internet e tente novamente.');
      } else if (msg.includes('invalid') || msg.includes('email')) {
        setError('Email inválido.');
      } else {
        setError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setIsLoading(true);
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
      setIsLoading(false);
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
          <ThemedText style={styles.title}>Criar sua conta</ThemedText>

          {error ? (
            <ThemedText style={[styles.error, { color: theme.danger }]}>{error}</ThemedText>
          ) : null}

          <SocialButton
            kind="google"
            label="Continuar com Google"
            onPress={handleGoogleSignIn}
            disabled={isLoading}
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
            editable={!isLoading}
          />
          <FormField
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            password
            autoComplete="new-password"
            textContentType="newPassword"
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />
          <FormField
            label="Confirmar senha"
            placeholder="••••••••"
            password
            autoComplete="new-password"
            textContentType="newPassword"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Criar conta"
            disabled={isLoading}
            onPress={handleRegister}
            style={({ pressed }) => [
              styles.primaryButton,
              Shadow.card,
              { backgroundColor: theme.primary, opacity: pressed || isLoading ? 0.75 : 1 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.textOnPrimary} />
            ) : (
              <ThemedText style={[styles.primaryButtonText, { color: theme.textOnPrimary }]}>
                Criar conta
              </ThemedText>
            )}
          </Pressable>

          <ThemedText style={[styles.terms, { color: theme.textMuted }]}>
            Ao criar conta você concorda com os{' '}
            <ThemedText style={[styles.termsLink, { color: theme.primary }]}>
              Termos de Uso
            </ThemedText>{' '}
            e a{' '}
            <ThemedText style={[styles.termsLink, { color: theme.primary }]}>
              Política de Privacidade
            </ThemedText>
            .
          </ThemedText>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.loginLink, { opacity: pressed ? 0.6 : 1 }]}
          >
            <ThemedText style={[styles.loginText, { color: theme.textSecondary }]}>
              Já tem conta?{' '}
              <ThemedText style={[styles.loginHighlight, { color: theme.primary }]}>
                Entrar
              </ThemedText>
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView edges={['top']} style={styles.backWrap} pointerEvents="box-none">
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
    height: 220,
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
  terms: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: FontWeight.semibold,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  loginText: {
    fontSize: FontSize.sm,
  },
  loginHighlight: {
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
