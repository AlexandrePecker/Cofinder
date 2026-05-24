import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const emptySubscribe = () => () => {};

/**
 * To support static rendering, the scheme is only trusted after client hydration.
 * useSyncExternalStore returns the server snapshot (false) during SSR and the client
 * snapshot (true) after hydration, avoiding a setState-in-effect.
 */
export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return hasHydrated ? colorScheme : 'light';
}
