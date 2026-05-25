import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/auth-context';
import { useProfile, useUpdateProfile } from '@/features/profile/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type FormProps = {
  initialName: string;
  avatarUrl: string | null;
  onSave: (name: string) => void;
  isSaving: boolean;
};

function ProfileForm({ initialName, avatarUrl, onSave, isSaving }: FormProps) {
  const theme = useTheme();
  const [displayName, setDisplayName] = useState(initialName);

  function handleSave() {
    const trimmed = displayName.trim();
    if (!trimmed) return;
    onSave(trimmed);
  }

  return (
    <>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.avatar, { borderColor: theme.border }]}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.primaryMuted, borderColor: theme.border },
          ]}
        />
      )}

      <ThemedText style={[styles.label, { color: theme.textMuted }]}>Nome</ThemedText>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Seu nome"
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text },
        ]}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />

      <Pressable
        onPress={handleSave}
        disabled={isSaving || !displayName.trim()}
        style={({ pressed }) => [
          styles.saveButton,
          {
            backgroundColor: theme.primary,
            opacity: pressed || isSaving || !displayName.trim() ? 0.6 : 1,
          },
        ]}
      >
        {isSaving ? (
          <ActivityIndicator color={theme.textOnPrimary} />
        ) : (
          <ThemedText style={[styles.saveLabel, { color: theme.textOnPrimary }]}>Salvar</ThemedText>
        )}
      </Pressable>
    </>
  );
}

export function ProfileSheet({ visible, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  async function handleSignOut() {
    onClose();
    await signOut();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <ThemedText style={styles.title}>Perfil</ThemedText>

          {isLoading ? (
            <ActivityIndicator style={styles.loader} />
          ) : (
            <ProfileForm
              key={profile?.display_name ?? ''}
              initialName={profile?.display_name ?? ''}
              avatarUrl={profile?.avatar_url ?? null}
              isSaving={isSaving}
              onSave={(name) => updateProfile({ display_name: name }, { onSuccess: onClose })}
            />
          )}

          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [styles.signOutButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <ThemedText style={[styles.signOutLabel, { color: theme.danger }]}>Sair</ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  loader: {
    paddingVertical: Spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignSelf: 'center',
    borderWidth: 2,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: -Spacing.xs,
  },
  input: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
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
  signOutButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
});
