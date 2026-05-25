import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { CryptoDigestAlgorithm, digest, getRandomValues } from 'expo-crypto';
import { AppState } from 'react-native';

import { env } from '@/lib/env';

// Polyfill crypto.subtle so Supabase PKCE uses SHA-256 instead of plain.
if (!globalThis.crypto?.subtle) {
  (globalThis as unknown as { crypto: unknown }).crypto = {
    getRandomValues,
    subtle: {
      digest: (_alg: string, data: ArrayBuffer) => digest(CryptoDigestAlgorithm.SHA256, data),
    },
  };
}

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Refresh tokens only while the app is foregrounded.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
