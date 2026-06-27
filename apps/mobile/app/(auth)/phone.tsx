import { useState } from 'react'
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
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { supabase } from '../../src/lib/supabase'
import { colors, duration, radius, spacing, typography } from '../../src/constants/theme'

export default function PhoneScreen() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const buttonScale = useSharedValue(1)
  const inputBorderColor = useSharedValue(colors.border)

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  const formatted = phone.replace(/\D/g, '')
  const isValid = formatted.length === 10 && formatted.startsWith('0')

  async function handleSendOTP() {
    if (!isValid) return

    // Feedback: button compresses on press
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 300 }, () => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 })
    })

    setLoading(true)
    const ghPhone = '+233' + formatted.slice(1)

    const { error } = await supabase.auth.signInWithOtp({ phone: ghPhone })

    setLoading(false)

    if (error) {
      Alert.alert('Could not send OTP', error.message)
      return
    }

    router.push({ pathname: '/(auth)/otp', params: { phone: ghPhone } })
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
        <Text style={styles.title}>Your phone number</Text>
        <Text style={styles.subtitle}>
          We'll send a one-time code to verify it's you. Standard SMS rates may apply.
        </Text>

        <View style={styles.inputWrapper}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>🇬🇭 +233</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="024 000 0000"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={11}
            autoFocus
          />
        </View>

        <Text style={styles.hint}>Ghana numbers only (MTN, Vodafone, AirtelTigo)</Text>
      </View>

      <View style={styles.footer}>
        <Animated.View style={buttonStyle}>
          <Pressable
            style={[styles.button, (!isValid || loading) && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={!isValid || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending…' : 'Send code'}
            </Text>
          </Pressable>
        </Animated.View>
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
    gap: spacing.md,
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
    lineHeight: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border + '33',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border + '33',
  },
  prefixText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: '500',
    letterSpacing: 1,
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: colors.brand,
    fontSize: typography.body,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
})
