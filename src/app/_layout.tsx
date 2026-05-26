import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    AsyncStorage.getItem('onboarding_seen').then((val) => {
      setOnboardingSeen(val === 'true');
    });
  }, []);

  useEffect(() => {
    if (isLoading || onboardingSeen === null) return;

    const onOnboarding = segments[0] === 'onboarding';
    const onAuthScreen = segments[0] === 'login' || segments[0] === 'register';

    if (!onboardingSeen && !onOnboarding) {
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
