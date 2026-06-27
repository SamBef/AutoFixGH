export type UserRole = 'owner' | 'mechanic' | 'technician' | 'admin'

export type UserProfile = {
  user_id: string
  phone: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}
