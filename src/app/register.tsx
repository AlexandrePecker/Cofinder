import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useSnackbar } from '@/components/snackbar-provider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Layout, Radius, Shadow, Spacing } from '@/theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
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

  const inputBorderColor = theme.border;
  const inputBg = theme.surface;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                onPress={() => router.back()}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <ThemedText style={[styles.backLabel, { color: theme.primary }]}>
                  ← Voltar
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.titleBlock}>
              <ThemedText style={styles.title}>Criar conta</ThemedText>
              <ThemedText style={[styles.subtitle, { color: theme.textMuted }]}>
                Comece a avaliar e descobrir cafeterias
              </ThemedText>
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
                editable={!isLoading}
              />
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, borderColor: inputBorderColor, color: theme.text },
                ]}
                placeholder="Senha (mínimo 6 caracteres)"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, borderColor: inputBorderColor, color: theme.text },
                ]}
                placeholder="Confirmar senha"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  safeArea: {
    flex: 1,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingBottom: Spacing.xl,
  },
  backLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  titleBlock: {
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: 22,
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
});
