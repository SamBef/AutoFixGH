import { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInputProps,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  useAnimatedRef,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { supabase } from '../../../src/lib/supabase'
import { useSession } from '../../../src/hooks/useSession'
import { colors, radius, spacing, typography, duration } from '../../../src/constants/theme'

type FormField = {
  key: keyof FormValues
  label: string
  placeholder: string
  hint?: string
  required: boolean
  keyboardType?: TextInputProps['keyboardType']
  autoCapitalize?: TextInputProps['autoCapitalize']
  maxLength?: number
}

type FormValues = {
  registration_plate: string
  make: string
  model: string
  year: string
  color: string
  vin: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const FIELDS: FormField[] = [
  {
    key: 'registration_plate',
    label: 'Registration plate',
    placeholder: 'e.g. GR-1234-22',
    hint: 'As shown on your vehicle plate',
    required: true,
    autoCapitalize: 'characters',
    maxLength: 12,
  },
  {
    key: 'make',
    label: 'Make',
    placeholder: 'e.g. Toyota, Hyundai, Nissan',
    required: true,
    autoCapitalize: 'words',
  },
  {
    key: 'model',
    label: 'Model',
    placeholder: 'e.g. Camry, Elantra, Almera',
    required: true,
    autoCapitalize: 'words',
  },
  {
    key: 'year',
    label: 'Year',
    placeholder: 'e.g. 2019',
    required: true,
    keyboardType: 'number-pad',
    maxLength: 4,
  },
  {
    key: 'color',
    label: 'Color',
    placeholder: 'e.g. Silver, Black, White',
    required: false,
    autoCapitalize: 'words',
    hint: 'Optional',
  },
  {
    key: 'vin',
    label: 'VIN (Chassis number)',
    placeholder: '17-character vehicle ID',
    required: false,
    autoCapitalize: 'characters',
    maxLength: 17,
    hint: 'Optional — helps with insurance claims later',
  },
]

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  const currentYear = new Date().getFullYear()

  if (!values.registration_plate.trim()) {
    errors.registration_plate = 'Plate number is required'
  } else if (values.registration_plate.trim().length < 5) {
    errors.registration_plate = 'Enter a valid Ghana plate number'
  }

  if (!values.make.trim()) {
    errors.make = 'Vehicle make is required'
  }

  if (!values.model.trim()) {
    errors.model = 'Vehicle model is required'
  }

  const yearNum = parseInt(values.year, 10)
  if (!values.year.trim()) {
    errors.year = 'Year is required'
  } else if (isNaN(yearNum) || yearNum < 1960 || yearNum > currentYear + 1) {
    errors.year = `Enter a year between 1960 and ${currentYear + 1}`
  }

  if (values.vin && values.vin.trim().length > 0 && values.vin.trim().length !== 17) {
    errors.vin = 'VIN must be exactly 17 characters'
  }

  return errors
}

function FieldCard({
  field,
  value,
  error,
  index,
  onChange,
  onNext,
  isLast,
}: {
  field: FormField
  value: string
  error?: string
  index: number
  onChange: (v: string) => void
  onNext: () => void
  isLast: boolean
}) {
  const translateY = useSharedValue(32)
  const opacity = useSharedValue(0)
  const borderColor = useSharedValue(0)

  useState(() => {
    translateY.value = withDelay(
      index * 70 + 100,
      withSpring(0, { damping: 22, stiffness: 180 }),
    )
    opacity.value = withDelay(
      index * 70 + 100,
      withTiming(1, { duration: duration.component, easing: Easing.out(Easing.exp) }),
    )
  })

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  const inputContainerStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value === 1
      ? colors.accent
      : error
      ? colors.danger
      : colors.border,
  }))

  return (
    <Animated.View style={[styles.fieldCard, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{field.label}</Text>
        {!field.required && (
          <Text style={styles.optionalBadge}>optional</Text>
        )}
      </View>

      <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
        <TextInput
          style={styles.input}
          placeholder={field.placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChange}
          keyboardType={field.keyboardType ?? 'default'}
          autoCapitalize={field.autoCapitalize ?? 'sentences'}
          maxLength={field.maxLength}
          returnKeyType={isLast ? 'done' : 'next'}
          onSubmitEditing={onNext}
          onFocus={() => { borderColor.value = 1 }}
          onBlur={() => { borderColor.value = 0 }}
        />
      </Animated.View>

      {field.hint && !error && (
        <Text style={styles.hint}>{field.hint}</Text>
      )}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </Animated.View>
  )
}

export default function VehicleRegisterScreen() {
  const { session } = useSession()
  const [values, setValues] = useState<FormValues>({
    registration_plate: '',
    make: '',
    model: '',
    year: '',
    color: '',
    vin: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  const buttonScale = useSharedValue(1)
  const headerOpacity = useSharedValue(0)
  const headerY = useSharedValue(-12)

  useState(() => {
    headerOpacity.value = withTiming(1, { duration: duration.component })
    headerY.value = withSpring(0, { damping: 20, stiffness: 180 })
  })

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }))

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  function setField(key: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  async function handleSave() {
    if (!session) return

    const validationErrors = validateForm(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    buttonScale.value = withSpring(0.94, { damping: 12, stiffness: 300 }, () => {
      buttonScale.value = withSpring(1, { damping: 12, stiffness: 300 })
    })

    setSaving(true)

    const { error } = await supabase.from('vehicles').insert({
      owner_id: session.user.id,
      registration_plate: values.registration_plate.trim().toUpperCase(),
      make: values.make.trim(),
      model: values.model.trim(),
      year: parseInt(values.year, 10),
      color: values.color.trim() || null,
      vin: values.vin.trim().toUpperCase() || null,
    })

    setSaving(false)

    if (error) {
      if (error.code === '23505') {
        setErrors({ registration_plate: 'This plate is already registered' })
      } else {
        Alert.alert('Something went wrong', 'Could not save your vehicle. Please try again.')
      }
      return
    }

    router.replace('/(app)/home')
  }

  function handleSkip() {
    Alert.alert(
      'Skip for now?',
      'You can still browse garages, but SOS dispatch requires a registered vehicle.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip anyway', onPress: () => router.replace('/(app)/home') },
      ],
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Animated.View style={headerStyle}>
          <Text style={styles.headerEyebrow}>Step 1 of 1</Text>
          <Text style={styles.headerTitle}>Register your vehicle</Text>
          <Text style={styles.headerSub}>
            Every job and SOS dispatch is tied to your vehicle — this seeds your Vehicle Health Score from day one.
          </Text>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {FIELDS.map((field, i) => (
          <FieldCard
            key={field.key}
            field={field}
            value={values[field.key]}
            error={errors[field.key]}
            index={i}
            onChange={(v) => setField(field.key, v)}
            onNext={() => {}}
            isLast={i === FIELDS.length - 1}
          />
        ))}

        <Animated.View style={[styles.actions, buttonStyle]}>
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving…' : 'Save vehicle & continue'}
            </Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerEyebrow: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    color: colors.textInverse,
    fontSize: typography.h1,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  headerSub: {
    color: colors.textInverse + '80',
    fontSize: typography.caption,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.section,
    gap: spacing.md,
  },
  fieldCard: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  optionalBadge: {
    color: colors.textMuted,
    fontSize: typography.micro,
    fontWeight: '500',
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '500',
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.micro,
    paddingHorizontal: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.micro,
    fontWeight: '600',
    paddingHorizontal: 2,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.brand,
    fontSize: typography.body,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '500',
  },
})
