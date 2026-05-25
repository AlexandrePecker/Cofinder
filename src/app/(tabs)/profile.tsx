import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { useSnackbar } from '@/components/snackbar-provider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/features/profile/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

function ProfileSkeleton() {
  const theme = useTheme();
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

  const bar = (w: number | `${number}%`, h: number = 14) => (
    <Animated.View
      style={{ width: w, height: h, borderRadius: 6, backgroundColor: theme.surfaceAlt, opacity }}
    />
  );

  return (
    <View style={styles.skeletonContent}>
      <Animated.View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: theme.surfaceAlt,
          alignSelf: 'center',
          opacity,
        }}
      />
      <View style={styles.skeletonField}>
        {bar('30%', 10)}
        {bar('100%', 48)}
      </View>
      <View style={styles.skeletonField}>
        {bar('25%', 10)}
        {bar('100%', 48)}
      </View>
    </View>
  );
}

function AvatarUpload({
  avatarUrl,
  displayName,
  onPress,
  isUploading,
}: {
  avatarUrl: string | null;
  displayName: string | null;
  onPress: () => void;
  isUploading: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={isUploading}
      style={({ pressed }) => [styles.avatarWrapper, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Avatar uri={avatarUrl} name={displayName} size={100} />
      <View style={[styles.avatarBadge, { backgroundColor: theme.primary }]}>
        {isUploading ? (
          <ActivityIndicator size="small" color={theme.textOnPrimary} />
        ) : (
          <ThemedText style={[styles.avatarBadgeIcon, { color: theme.textOnPrimary }]}>
            ✎
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

const MAX_DISPLAY_NAME = 80;

function NameForm({
  initialName,
  onSave,
  isSaving,
}: {
  initialName: string;
  onSave: (name: string) => void;
  isSaving: boolean;
}) {
  const theme = useTheme();
  const [value, setValue] = useState(initialName);
  const hasChanges = value.trim() !== initialName;

  return (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: theme.textMuted }]}>Nome</ThemedText>
      <TextInput
        value={value}
        onChangeText={(text) => setValue(text.slice(0, MAX_DISPLAY_NAME))}
        placeholder="Seu nome"
        maxLength={MAX_DISPLAY_NAME}
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text },
        ]}
        returnKeyType="done"
        onSubmitEditing={() => {
          const trimmed = value.trim();
          if (trimmed && hasChanges) onSave(trimmed);
        }}
      />
      {hasChanges ? (
        <Pressable
          onPress={() => {
            const trimmed = value.trim();
            if (trimmed) onSave(trimmed);
          }}
          disabled={isSaving || !value.trim()}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: theme.primary,
              opacity: pressed || isSaving ? 0.7 : 1,
            },
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color={theme.textOnPrimary} />
          ) : (
            <ThemedText style={[styles.saveLabel, { color: theme.textOnPrimary }]}>
              Salvar
            </ThemedText>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { session, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();
  const { showSnackbar } = useSnackbar();

  const email = session?.user?.email ?? null;
  const displayName =
    profile?.display_name ??
    (session?.user?.user_metadata?.full_name as string | undefined) ??
    null;

  const handleUpload = useCallback(() => {
    uploadAvatar(undefined, {
      onSuccess: () => showSnackbar('Foto atualizada!', 'success'),
      onError: (err) => {
        const msg = err instanceof Error ? err.message : '';
        if (!msg || msg === 'cancelled') return;
        if (msg === 'Permissão de galeria negada.') {
          showSnackbar('Acesse Configurações para permitir fotos', 'error');
        } else {
          showSnackbar('Erro ao atualizar foto', 'error');
        }
      },
    });
  }, [uploadAvatar, showSnackbar]);

  function handleSignOut() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        edges={['top']}
        style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}
      >
        <ThemedText style={styles.title}>Perfil</ThemedText>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {isLoading ? (
            <ProfileSkeleton />
          ) : (
            <>
              <AvatarUpload
                avatarUrl={profile?.avatar_url ?? null}
                displayName={displayName}
                onPress={handleUpload}
                isUploading={isUploading}
              />

              {email ? (
                <View style={styles.field}>
                  <ThemedText style={[styles.label, { color: theme.textMuted }]}>Email</ThemedText>
                  <View
                    style={[
                      styles.input,
                      styles.inputReadOnly,
                      { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                    ]}
                  >
                    <ThemedText style={[styles.inputText, { color: theme.textSecondary }]}>
                      {email}
                    </ThemedText>
                  </View>
                </View>
              ) : null}

              <NameForm
                key={profile?.display_name ?? ''}
                initialName={profile?.display_name ?? ''}
                isSaving={isSaving}
                onSave={(name) =>
                  updateProfile(
                    { display_name: name },
                    {
                      onSuccess: () => showSnackbar('Perfil salvo!', 'success'),
                      onError: () => showSnackbar('Erro ao salvar perfil', 'error'),
                    },
                  )
                }
              />
            </>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [styles.signOutButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <ThemedText style={[styles.signOutLabel, { color: theme.danger }]}>Sair</ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  skeletonContent: {
    gap: Spacing.lg,
    paddingTop: Spacing.md,
  },
  skeletonField: {
    gap: Spacing.xs,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginVertical: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    borderWidth: 2,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeIcon: {
    fontSize: 13,
    lineHeight: 16,
  },
  field: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
  },
  inputReadOnly: {
    justifyContent: 'center',
  },
  inputText: {
    fontSize: FontSize.md,
  },
  saveButton: {
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  signOutButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
});
