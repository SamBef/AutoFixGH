import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from './useSession'

export type Vehicle = {
  vehicle_id: string
  owner_id: string
  registration_plate: string
  vin: string | null
  make: string
  model: string
  year: number
  color: string | null
  created_at: string
  updated_at: string
}

export function useVehicles() {
  const { session } = useSession()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVehicles = useCallback(async () => {
    if (!session) {
      setVehicles([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false })
    setVehicles(data ?? [])
    setLoading(false)
  }, [session?.user.id])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  return {
    vehicles,
    loading,
    hasVehicles: vehicles.length > 0,
    primaryVehicle: vehicles[0] ?? null,
    refetch: fetchVehicles,
  }
}
