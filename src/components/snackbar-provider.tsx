import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

type SnackbarType = 'success' | 'error' | 'default';

interface SnackbarContextValue {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextValue>({ showSnackbar: () => {} });

export function useSnackbar() {
  return useContext(SnackbarContext);
}

function SnackbarOverlay({
  message,
  type,
  translateY,
  opacity,
}: {
  message: string;
  type: SnackbarType;
  translateY: Animated.Value;
  opacity: Animated.Value;
}) {
  const theme = useTheme();

  const bgColor =
    type === 'success' ? theme.success : type === 'error' ? theme.danger : theme.surface;
  const textColor = type === 'default' ? theme.text : '#FFFFFF';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.snackbar,
        { backgroundColor: bgColor, borderColor: theme.border },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <ThemedText style={[styles.text, { color: textColor }]}>{message}</ThemedText>
    </Animated.View>
  );
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('default');
  const [visible, setVisible] = useState(false);
  const [translateY] = useState(() => new Animated.Value(80));
  const [opacity] = useState(() => new Animated.Value(0));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSnackbar = useCallback(
    (msg: string, t: SnackbarType = 'default') => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setMessage(msg);
      setType(t);
      setVisible(true);

      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 80, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => setVisible(false));
      }, 2500);
    },
    [translateY, opacity],
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      <View style={styles.root}>
        {children}
        {visible ? (
          <SnackbarOverlay
            message={message}
            type={type}
            translateY={translateY}
            opacity={opacity}
          />
        ) : null}
      </View>
    </SnackbarContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  snackbar: {
    position: 'absolute',
    bottom: 96,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
});
