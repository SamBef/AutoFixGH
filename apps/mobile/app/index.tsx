import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { supabase } from '../src/lib/supabase'
import { useSession } from '../src/hooks/useSession'
import { colors } from '../src/constants/theme'

export default function Index() {
  const { session, loading: sessionLoading } = useSession()
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [hasVehicle, setHasVehicle] = useState<boolean | null>(null)

  useEffect(() => {
    if (!session) {
      setHasVehicle(null)
      return
    }
    setVehicleLoading(true)
    supabase
      .from('vehicles')
      .select('vehicle_id', { count: 'exact', head: true })
      .eq('owner_id', session.user.id)
      .then(({ count }) => {
        setHasVehicle((count ?? 0) > 0)
        setVehicleLoading(false)
      })
  }, [session?.user.id])

  const loading = sessionLoading || vehicleLoading

  if (loading || (session && hasVehicle === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.brand }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  }

  if (!session) return <Redirect href="/(auth)/welcome" />
  if (!hasVehicle) return <Redirect href="/(app)/vehicle/register" />
  return <Redirect href="/(app)/home" />
}
