import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { supabase } from '../../src/lib/supabase'
import { colors, duration, radius, spacing, typography } from '../../src/constants/theme'

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(TextInput | null)[]>([])

  // Shake animation for wrong OTP — feedback
  const shakeX = useSharedValue(0)
  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }))

  function shake() {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    )
  }

  function handleChange(value: string, index: number) {
    const digits = value.replace(/\D/g, '')
    if (!digits && !value) {
      const next = [...otp]
      next[index] = ''
      setOtp(next)
      if (index > 0) inputs.current[index - 1]?.focus()
      return
    }
    const digit = digits.slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (index < 5 && digit) inputs.current[index + 1]?.focus()
  }

  const code = otp.join('')
  const isComplete = code.length === 6

  useEffect(() => {
    if (isComplete) verifyOTP()
  }, [isComplete])

  async function verifyOTP() {
    if (!phone || !isComplete) return
    setLoading(true)

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    })

    setLoading(false)

    if (error) {
      shake()
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
      Alert.alert('Incorrect code', 'Double-check the SMS and try again.')
      return
    }

    // State change: verified — transition to onboarding or home
    router.replace('/(app)/home')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Enter the code</Text>
        <Text style={styles.subtitle}>
          Sent to {phone?.replace('+233', '0')}
        </Text>

        <Animated.View style={[styles.otpRow, rowStyle]}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              style={[styles.otpBox, digit && styles.otpBoxFilled]}
              value={digit}
              onChangeText={(v) => handleChange(v, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={i === 0}
            />
          ))}
        </Animated.View>

        {loading && <Text style={styles.verifying}>Verifying…</Text>}
      </View>

      <View style={styles.footer}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.resend}>Didn't get it? Resend code</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  back: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backText: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    color: colors.textInverse,
    fontSize: typography.h1,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.brandLight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border + '33',
    color: colors.textInverse,
    fontSize: typography.h2,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '15',
  },
  verifying: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  resend: {
    color: colors.accent,
    fontSize: typography.body,
    fontWeight: '600',
  },
})
