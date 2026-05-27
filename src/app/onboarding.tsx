import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { CoffeeHero } from '@/components/coffee-hero';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight, Radius, Spacing } from '@/theme';

const SLIDES = [
  {
    id: '1',
    title: 'Encontre seu café perfeito',
    description:
      'Descubra cafeterias bem avaliadas perto de você, filtradas por nota, preço e distância.',
  },
  {
    id: '2',
    title: 'Avalie e salve favoritos',
    description:
      'Registre suas experiências, salve os cafés que você ama e acompanhe o que já visitou.',
  },
  {
    id: '3',
    title: 'Precisamos da sua localização',
    description:
      'Para mostrar cafés próximos, o Cofinder precisa saber onde você está. Sua localização nunca é armazenada.',
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  async function finish() {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    router.replace('/login');
  }

  async function next() {
    if (isLast) {
      await finish();
      return;
    }
    setIndex((i) => i + 1);
  }

  return (
    <View style={styles.container}>
      <CoffeeHero variant="splash" style={styles.hero} />

      <SafeAreaView edges={['top']} style={styles.topBar} pointerEvents="box-none">
        <BrandMark size={44} iconColor={theme.text} />
        {!isLast ? (
          <Pressable
            onPress={finish}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <ThemedText style={styles.skip}>Pular</ThemedText>
          </Pressable>
        ) : null}
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottom}>
        <LinearGradient colors={[theme.primarySoft, theme.background]} style={styles.card}>
          <View style={[styles.grip, { backgroundColor: theme.text }]} />
          <ThemedText style={styles.title}>{slide.title}</ThemedText>
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            {slide.description}
          </ThemedText>

          <View style={styles.footerRow}>
            <View style={styles.dots}>
              {SLIDES.map((s, i) => (
                <View
                  key={s.id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === index ? theme.primary : theme.primaryMuted,
                      width: i === index ? 22 : 6,
                    },
                  ]}
                />
              ))}
            </View>

            <Pressable
              onPress={next}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <ThemedText style={[styles.nextText, { color: theme.textOnPrimary }]}>
                {isLast ? 'Começar' : 'Próximo'}
              </ThemedText>
              <Ionicons name="arrow-forward" size={16} color={theme.textOnPrimary} />
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1108',
  },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  skip: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    opacity: 0.9,
  },
  bottom: {
    marginTop: 'auto',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  card: {
    borderRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  grip: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    alignSelf: 'center',
    opacity: 0.4,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.6,
    textAlign: 'center',
    lineHeight: 36,
  },
  description: {
    fontSize: FontSize.md,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: Radius.full,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  nextText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
