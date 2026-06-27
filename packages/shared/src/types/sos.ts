export type SOSStatus =
  | 'REQUESTED'
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'RESOLVED'
  | 'CANCELLED'

export type SOSDispatch = {
  dispatch_id: string
  vehicle_id: string
  owner_id: string
  technician_id: string | null
  status: SOSStatus
  latitude: number
  longitude: number
  description: string | null
  created_at: string
  updated_at: string
}

export type SOSDispatchInsert = Omit<SOSDispatch, 'dispatch_id' | 'created_at' | 'updated_at'>
