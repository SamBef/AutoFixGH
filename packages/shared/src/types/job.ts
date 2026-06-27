export type JobStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type JobType = 'self_pay' | 'insurance'

export type Job = {
  job_id: string
  vehicle_id: string
  garage_id: string
  owner_id: string
  type: JobType
  status: JobStatus
  description: string
  amount: number | null
  currency: 'GHS'
  created_at: string
  updated_at: string
}

export type JobInsert = Omit<Job, 'job_id' | 'created_at' | 'updated_at'>
