import { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated'
import { colors, duration, radius, spacing, typography } from '../../src/constants/theme'

const { height } = Dimensions.get('window')

export default function WelcomeScreen() {
  const logoOpacity = useSharedValue(0)
  const logoY = useSharedValue(24)
  const taglineOpacity = useSharedValue(0)
  const taglineY = useSharedValue(16)
  const cardY = useSharedValue(60)
  const cardOpacity = useSharedValue(0)
  const indicatorScale = useSharedValue(0)

  useEffect(() => {
    // Logo reveals first — state change: app has loaded
    logoOpacity.value = withTiming(1, { duration: duration.component, easing: Easing.out(Easing.exp) })
    logoY.value = withTiming(0, { duration: duration.component, easing: Easing.out(Easing.exp) })

    // Tagline follows — sequence, not simultaneous
    taglineOpacity.value = withDelay(200, withTiming(1, { duration: duration.component, easing: Easing.out(Easing.exp) }))
    taglineY.value = withDelay(200, withTiming(0, { duration: duration.component, easing: Easing.out(Easing.exp) }))

    // Card springs up from bottom — transition into action
    cardY.value = withDelay(380, withSpring(0, { damping: 20, stiffness: 180 }))
    cardOpacity.value = withDelay(380, withTiming(1, { duration: duration.component }))

    // SOS pulse — attention, draws eye to the primary CTA
    indicatorScale.value = withDelay(700, withSpring(1, { damping: 12, stiffness: 120 }))
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }))

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }))

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }))

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scale: indicatorScale.value }],
  }))

  return (
    <View style={styles.container}>
      {/* Background grid — subtle depth */}
      <View style={styles.grid} />

      {/* Hero section */}
      <View style={styles.hero}>
        <Animated.View style={[styles.logoRow, logoStyle]}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>AF</Text>
          </View>
          <Text style={styles.logoText}>AutoFix GH</Text>
        </Animated.View>

        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Ghana's roadside rescue,{'\n'}when you need it most.
        </Animated.Text>

        {/* Kofi placeholder — 3D character drops in here via Spline/R3F */}
        <Animated.View style={[styles.characterPlaceholder, indicatorStyle]}>
          <View style={styles.sosOrb}>
            <Text style={styles.sosOrbText}>SOS</Text>
          </View>
          <Text style={styles.characterLabel}>Kofi is ready</Text>
        </Animated.View>
      </View>

      {/* Bottom card — action */}
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.cardTitle}>Get started</Text>
        <Text style={styles.cardSubtitle}>
          Register your vehicle and get access to roadside rescue and trusted garages across Ghana.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={() => router.push('/(auth)/phone')}
        >
          <Text style={styles.primaryButtonText}>Continue with phone number</Text>
        </Pressable>

        <Text style={styles.terms}>
          By continuing you agree to our Terms of Service and Privacy Policy
        </Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    // Grid is a background texture — rendered via SVG or image in production
  },
  hero: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: height * 0.12,
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMarkText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tagline: {
    color: colors.textInverse,
    fontSize: typography.h1,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: spacing.xxl,
  },
  characterPlaceholder: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  sosOrb: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  sosOrbText: {
    color: colors.textInverse,
    fontSize: typography.h3,
    fontWeight: '900',
    letterSpacing: 2,
  },
  characterLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  terms: {
    color: colors.textMuted,
    fontSize: typography.micro,
    textAlign: 'center',
    lineHeight: 18,
  },
})
