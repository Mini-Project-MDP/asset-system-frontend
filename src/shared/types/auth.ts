export interface Permission {
  id: string
  code: string
  name: string
  description: string
}

export interface Role {
  id: string
  code: string
  name: string
  role_type: string
  approval_rank: number
  is_active: boolean
  permissions?: Permission[]
}

export interface UserSetting {
  theme: string
  email_notifications: boolean
}

export interface UserProfile {
  id: string
  employee_no: string
  name: string
  email: string
  status: string
  is_master: boolean
  roles: Role[]
  permissions: string[]
  settings?: UserSetting
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_at: string
  user: UserProfile
}
