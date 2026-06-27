import { useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import { colors, duration, radius, spacing, typography } from '../../src/constants/theme'
import { useSession } from '../../src/hooks/useSession'

const { width } = Dimensions.get('window')

export default function HomeScreen() {
  const { session } = useSession()

  // Staggered entrance — state change: screen has loaded
  const headerOpacity = useSharedValue(0)
  const headerY = useSharedValue(-16)
  const cardOneY = useSharedValue(32)
  const cardOneOpacity = useSharedValue(0)
  const cardTwoY = useSharedValue(32)
  const cardTwoOpacity = useSharedValue(0)
  const sosScale = useSharedValue(0.9)
  const sosOpacity = useSharedValue(0)

  // Attention: SOS pulse — draws eye to the primary emergency action
  const sosPulse = useSharedValue(1)

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: duration.component, easing: Easing.out(Easing.exp) })
    headerY.value = withTiming(0, { duration: duration.component, easing: Easing.out(Easing.exp) })

    cardOneOpacity.value = withDelay(150, withTiming(1, { duration: duration.component }))
    cardOneY.value = withDelay(150, withSpring(0, { damping: 20, stiffness: 180 }))

    cardTwoOpacity.value = withDelay(250, withTiming(1, { duration: duration.component }))
    cardTwoY.value = withDelay(250, withSpring(0, { damping: 20, stiffness: 180 }))

    sosOpacity.value = withDelay(380, withTiming(1, { duration: duration.component }))
    sosScale.value = withDelay(380, withSpring(1, { damping: 14, stiffness: 140 }))

    // Pulse every 3s — attention, communicates readiness
    sosPulse.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.06, { duration: 700, easing: Easing.out(Easing.sin) }),
          withTiming(1, { duration: 700, easing: Easing.in(Easing.sin) }),
        ),
        -1,
        false,
      ),
    )
  }, [])

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }))

  const cardOneStyle = useAnimatedStyle(() => ({
    opacity: cardOneOpacity.value,
    transform: [{ translateY: cardOneY.value }],
  }))

  const cardTwoStyle = useAnimatedStyle(() => ({
    opacity: cardTwoOpacity.value,
    transform: [{ translateY: cardTwoY.value }],
  }))

  const sosStyle = useAnimatedStyle(() => ({
    opacity: sosOpacity.value,
    transform: [{ scale: sosScale.value }],
  }))

  const sosPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sosPulse.value }],
  }))

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>Your vehicles</Text>
          </View>
          <Pressable style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </Pressable>
        </Animated.View>

        {/* SOS Card — primary action, center of gravity */}
        <Animated.View style={[styles.sosCard, sosStyle]}>
          <View style={styles.sosCardContent}>
            <View>
              <Text style={styles.sosCardTitle}>Need help?</Text>
              <Text style={styles.sosCardSubtitle}>
                One tap dispatches a technician to your location
              </Text>
            </View>
            <Animated.View style={sosPulseStyle}>
              <Pressable
                style={styles.sosButton}
                onPress={() => router.push('/(app)/sos')}
              >
                <Text style={styles.sosButtonText}>SOS</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick actions</Text>

        <View style={styles.quickGrid}>
          <Animated.View style={[styles.quickCard, cardOneStyle]}>
            <Pressable
              style={styles.quickCardInner}
              onPress={() => router.push('/(app)/garage')}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.success + '15' }]}>
                <Text style={styles.quickIconEmoji}>🔧</Text>
              </View>
              <Text style={styles.quickCardTitle}>Find a garage</Text>
              <Text style={styles.quickCardDesc}>Book a repair near you</Text>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.quickCard, cardTwoStyle]}>
            <Pressable style={styles.quickCardInner}>
              <View style={[styles.quickIcon, { backgroundColor: colors.accent + '15' }]}>
                <Text style={styles.quickIconEmoji}>📋</Text>
              </View>
              <Text style={styles.quickCardTitle}>My vehicles</Text>
              <Text style={styles.quickCardDesc}>Add or manage vehicles</Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* Recent jobs placeholder */}
        <Text style={styles.sectionTitle}>Recent jobs</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No jobs yet. Book your first repair.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '500',
  },
  name: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: '700',
  },
  sosCard: {
    margin: spacing.lg,
    backgroundColor: colors.brand,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  sosCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
  },
  sosCardTitle: {
    color: colors.textInverse,
    fontSize: typography.h3,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sosCardSubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
    maxWidth: width * 0.45,
  },
  sosButton: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  sosButtonText: {
    color: colors.textInverse,
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickCard: {
    flex: 1,
  },
  quickCardInner: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickIconEmoji: {
    fontSize: 22,
  },
  quickCardTitle: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  quickCardDesc: {
    color: colors.textSecondary,
    fontSize: typography.micro,
    lineHeight: 16,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
  },
})
