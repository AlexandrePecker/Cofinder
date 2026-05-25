import { Image } from 'expo-image';
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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/auth-context';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/features/profile/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

function AvatarSection({
  avatarUrl,
  onPress,
  isUploading,
}: {
  avatarUrl: string | null;
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
        onChangeText={setValue}
        placeholder="Seu nome"
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

  const email = session?.user?.email ?? null;

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
            <ActivityIndicator style={styles.loader} />
          ) : (
            <>
              <AvatarSection
                avatarUrl={profile?.avatar_url ?? null}
                onPress={() => uploadAvatar()}
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
                onSave={(name) => updateProfile({ display_name: name })}
              />
            </>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Pressable
            onPress={signOut}
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
  loader: {
    paddingVertical: Spacing.xxl,
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
