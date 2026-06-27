import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated'
import { supabase } from '../../../src/lib/supabase'
import { colors, radius, spacing, typography } from '../../../src/constants/theme'

type Garage = {
  garage_id: string
  name: string
  address: string
  phone: string | null
  latitude: number | null
  longitude: number | null
}

export default function GarageScreen() {
  const [garages, setGarages] = useState<Garage[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const headerY = useSharedValue(-16)
  const headerOpacity = useSharedValue(0)

  useEffect(() => {
    headerY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.exp) })
    headerOpacity.value = withTiming(1, { duration: 300 })
    fetchGarages()
  }, [])

  async function fetchGarages() {
    const { data } = await supabase
      .from('garages')
      .select('garage_id, name, address, phone, latitude, longitude')
      .eq('is_active', true)
      .limit(20)

    setGarages(data ?? [])
    setLoading(false)
  }

  const filtered = garages.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.address.toLowerCase().includes(search.toLowerCase()),
  )

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }))

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={styles.title}>Find a garage</Text>
        <TextInput
          style={styles.search}
          placeholder="Search by name or area…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <Text style={styles.loadingText}>Finding garages near you…</Text>
        )}

        {!loading && filtered.length === 0 && (
          <Text style={styles.emptyText}>No garages found. Try a different search.</Text>
        )}

        {filtered.map((garage, i) => (
          <GarageCard key={garage.garage_id} garage={garage} index={i} />
        ))}
      </ScrollView>
    </View>
  )
}

function GarageCard({ garage, index }: { garage: Garage; index: number }) {
  const cardY = useSharedValue(24)
  const cardOpacity = useSharedValue(0)

  useEffect(() => {
    cardOpacity.value = withDelay(index * 60, withTiming(1, { duration: 250 }))
    cardY.value = withDelay(index * 60, withSpring(0, { damping: 20, stiffness: 200 }))
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }))

  return (
    <Animated.View style={style}>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.cardIconBox}>
          <Text style={styles.cardIconText}>🔧</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName}>{garage.name}</Text>
          <Text style={styles.cardAddress}>{garage.address}</Text>
          {garage.phone && (
            <Text style={styles.cardPhone}>{garage.phone}</Text>
          )}
        </View>
        <View style={styles.cardArrow}>
          <Text style={styles.cardArrowText}>→</Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  search: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    fontSize: typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: typography.body,
    marginTop: spacing.xxl,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: typography.body,
    marginTop: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: {
    fontSize: 22,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  cardAddress: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  cardPhone: {
    color: colors.textMuted,
    fontSize: typography.micro,
    marginTop: 2,
  },
  cardArrow: {
    padding: spacing.xs,
  },
  cardArrowText: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
})
