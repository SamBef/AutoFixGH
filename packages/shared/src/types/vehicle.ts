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

export type VehicleInsert = Omit<Vehicle, 'vehicle_id' | 'created_at' | 'updated_at'>
