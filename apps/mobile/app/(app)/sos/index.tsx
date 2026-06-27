import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import * as Location from 'expo-location'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { supabase } from '../../../src/lib/supabase'
import { useSession } from '../../../src/hooks/useSession'
import { colors, duration, radius, spacing, typography } from '../../../src/constants/theme'

type SOSState = 'idle' | 'locating' | 'confirming' | 'dispatched'

const { width, height } = Dimensions.get('window')

export default function SOSScreen() {
  const { session } = useSession()
  const [sosState, setSosState] = useState<SOSState>('idle')
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [dispatchId, setDispatchId] = useState<string | null>(null)

  // Ripple rings — attention: communicates SOS is active/ready
  const ring1Scale = useSharedValue(1)
  const ring1Opacity = useSharedValue(0.3)
  const ring2Scale = useSharedValue(1)
  const ring2Opacity = useSharedValue(0.2)
  const ring3Scale = useSharedValue(1)
  const ring3Opacity = useSharedValue(0.1)

  // Button press — feedback
  const buttonScale = useSharedValue(1)

  // Status card — transition: slides up on dispatch
  const cardY = useSharedValue(120)
  const cardOpacity = useSharedValue(0)

  useEffect(() => {
    startRipple()
  }, [])

  function startRipple() {
    const rippleConfig = { duration: 2000, easing: Easing.out(Easing.exp) }

    ring1Scale.value = withRepeat(
      withSequence(withTiming(1, { duration: 0 }), withTiming(2.2, rippleConfig)),
      -1, false,
    )
    ring1Opacity.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 0 }), withTiming(0, rippleConfig)),
      -1, false,
    )

    ring2Scale.value = withDelay(600, withRepeat(
      withSequence(withTiming(1, { duration: 0 }), withTiming(2.2, rippleConfig)),
      -1, false,
    ))
    ring2Opacity.value = withDelay(600, withRepeat(
      withSequence(withTiming(0.2, { duration: 0 }), withTiming(0, rippleConfig)),
      -1, false,
    ))

    ring3Scale.value = withDelay(1200, withRepeat(
      withSequence(withTiming(1, { duration: 0 }), withTiming(2.2, rippleConfig)),
      -1, false,
    ))
    ring3Opacity.value = withDelay(1200, withRepeat(
      withSequence(withTiming(0.1, { duration: 0 }), withTiming(0, rippleConfig)),
      -1, false,
    ))
  }

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }))
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }))
  const ring3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring3Scale.value }],
    opacity: ring3Opacity.value,
  }))
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }))

  async function handleSOS() {
    if (!session) return

    // Feedback: button compresses on press
    buttonScale.value = withSpring(0.92, { damping: 12, stiffness: 300 }, () => {
      buttonScale.value = withSpring(1, { damping: 12, stiffness: 300 })
    })

    setSosState('locating')

    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Location required',
        'AutoFix GH needs your location to send help to you.',
      )
      setSosState('idle')
      return
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    setLocation(loc)
    setSosState('confirming')
  }

  async function confirmDispatch() {
    if (!session || !location) return

    setSosState('dispatched')

    // State change: dispatched — card transitions up
    cardY.value = withSpring(0, { damping: 20, stiffness: 160 })
    cardOpacity.value = withTiming(1, { duration: duration.component })

    // Create dispatch in Supabase — vehicle_id required; using placeholder until vehicle selection is built
    const { data, error } = await supabase.from('sos_dispatches').insert({
      owner_id: session.user.id,
      vehicle_id: '00000000-0000-0000-0000-000000000000', // replaced when vehicle selection screen is built
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      status: 'REQUESTED',
    }).select('dispatch_id').single()

    if (error) {
      Alert.alert('Dispatch failed', 'Could not send SOS. Please call 112 for emergencies.')
      setSosState('idle')
      return
    }

    setDispatchId(data.dispatch_id)
  }

  return (
    <View style={styles.container}>
      {/* Dark overlay background */}
      <View style={styles.bg} />

      <View style={styles.orbContainer}>
        {/* Ripple rings — attention */}
        <Animated.View style={[styles.ring, ring3Style]} />
        <Animated.View style={[styles.ring, ring2Style]} />
        <Animated.View style={[styles.ring, ring1Style]} />

        {/* Main SOS button */}
        <Animated.View style={buttonStyle}>
          <Pressable
            style={[styles.sosOrb, sosState !== 'idle' && styles.sosOrbActive]}
            onPress={sosState === 'idle' ? handleSOS : undefined}
            disabled={sosState !== 'idle'}
          >
            {sosState === 'locating' ? (
              <ActivityIndicator color={colors.textInverse} size="large" />
            ) : (
              <>
                <Text style={styles.sosOrbText}>SOS</Text>
                <Text style={styles.sosOrbSub}>
                  {sosState === 'idle' ? 'Tap to call for help' : 'Help is coming'}
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      </View>

      {/* Confirm location card */}
      {sosState === 'confirming' && (
        <View style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>Confirm your location</Text>
          <Text style={styles.confirmCoords}>
            {location?.coords.latitude.toFixed(5)}, {location?.coords.longitude.toFixed(5)}
          </Text>
          <Text style={styles.confirmHint}>
            A technician will be dispatched to this GPS position
          </Text>
          <Pressable style={styles.confirmButton} onPress={confirmDispatch}>
            <Text style={styles.confirmButtonText}>Send SOS now</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => setSosState('idle')}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* Dispatched status card — state change */}
      {sosState === 'dispatched' && (
        <Animated.View style={[styles.dispatchedCard, cardStyle]}>
          <View style={styles.dispatchedIndicator} />
          <Text style={styles.dispatchedTitle}>Help is on the way</Text>
          <Text style={styles.dispatchedSub}>
            Dispatch ID: {dispatchId?.slice(0, 8).toUpperCase() ?? '—'}
          </Text>
          <Text style={styles.dispatchedNote}>
            You'll receive an SMS when a technician is assigned and en route.
          </Text>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050710',
  },
  orbContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  sosOrb: {
    width: 160,
    height: 160,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 16,
  },
  sosOrbActive: {
    backgroundColor: colors.dangerLight,
  },
  sosOrbText: {
    color: colors.textInverse,
    fontSize: typography.h1,
    fontWeight: '900',
    letterSpacing: 4,
  },
  sosOrbSub: {
    color: colors.textInverse + 'BB',
    fontSize: typography.micro,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  confirmCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  confirmTitle: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  confirmCoords: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontFamily: 'monospace',
  },
  confirmHint: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  confirmButton: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  confirmButtonText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: '800',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '500',
  },
  dispatchedCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  dispatchedIndicator: {
    width: 48,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.success,
    marginBottom: spacing.sm,
  },
  dispatchedTitle: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dispatchedSub: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontFamily: 'monospace',
  },
  dispatchedNote: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
})
