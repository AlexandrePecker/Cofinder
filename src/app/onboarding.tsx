import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: '☕',
    title: 'Encontre seu café perfeito',
    description:
      'Descubra cafeterias bem avaliadas perto de você, filtradas por nota, preço e distância.',
  },
  {
    id: '2',
    icon: '⭐',
    title: 'Avalie e salve favoritos',
    description:
      'Registre suas experiências, salve os cafés que você ama e acompanhe o que já visitou.',
  },
  {
    id: '3',
    icon: '📍',
    title: 'Precisamos da sua localização',
    description:
      'Para mostrar cafés próximos, o Cofinder precisa saber onde você está. Sua localização nunca é armazenada.',
  },
];

type Slide = (typeof SLIDES)[number];

function SlideItem({ item }: { item: Slide }) {
  const theme = useTheme();
  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <ThemedText style={styles.slideIcon}>{item.icon}</ThemedText>
      <ThemedText style={styles.slideTitle}>{item.title}</ThemedText>
      <ThemedText style={[styles.slideDescription, { color: theme.textSecondary }]}>
        {item.description}
      </ThemedText>
    </View>
  );
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = index === SLIDES.length - 1;

  async function finish() {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    router.replace('/login');
  }

  function next() {
    if (isLast) {
      finish();
      return;
    }
    const nextIndex = index + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setIndex(nextIndex);
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SlideItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.list}
      />

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? theme.primary : theme.border,
                  width: i === index ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={next}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <ThemedText style={[styles.buttonText, { color: theme.textOnPrimary }]}>
            {isLast ? 'Começar' : 'Próximo'}
          </ThemedText>
        </Pressable>

        {!isLast && (
          <Pressable
            onPress={finish}
            style={({ pressed }) => [styles.skip, { opacity: pressed ? 0.5 : 1 }]}
          >
            <ThemedText style={[styles.skipText, { color: theme.textMuted }]}>Pular</ThemedText>
          </Pressable>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.lg,
  },
  slideIcon: {
    fontSize: 72,
    lineHeight: 88,
  },
  slideTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 36,
  },
  slideDescription: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: Radius.full,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  skip: {
    paddingVertical: Spacing.xs,
  },
  skipText: {
    fontSize: FontSize.sm,
  },
});
