import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SnackbarProvider } from '@/components/snackbar-provider';
import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import '@/theme';

const queryClient = new QueryClient();

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);
  const wasOnOnboarding = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_seen')
      .then((val) => setOnboardingSeen(val === 'true'))
      .catch(() => setOnboardingSeen(true));
  }, []);

  // Re-read AsyncStorage when leaving the onboarding screen so the in-memory
  // state reflects what finish() wrote before navigating away.
  useEffect(() => {
    const isOnOnboarding = segments[0] === 'onboarding';
    if (wasOnOnboarding.current && !isOnOnboarding) {
      AsyncStorage.getItem('onboarding_seen')
        .then((val) => setOnboardingSeen(val === 'true'))
        .catch(() => setOnboardingSeen(true));
    }
    wasOnOnboarding.current = isOnOnboarding;
  }, [segments]);

  useEffect(() => {
    if (isLoading || onboardingSeen === null) return;

    const onOnboarding = segments[0] === 'onboarding';
    const onAuthScreen = segments[0] === 'login' || segments[0] === 'register';

    if (!onboardingSeen && !onOnboarding && !onAuthScreen) {
      router.replace('/onboarding');
      return;
    }

    if (!session && !onAuthScreen && !onOnboarding) {
      router.replace('/login');
    } else if (session && onAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments, router, onboardingSeen]);

  if (isLoading || onboardingSeen === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <SnackbarProvider>
              <RootNavigator />
            </SnackbarProvider>
          </AuthProvider>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
