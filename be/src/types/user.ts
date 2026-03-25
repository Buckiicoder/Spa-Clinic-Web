export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export interface UserModel {
  id: number
  email: string
  password_hash: string
  full_name: string
  role: UserRole
  created_at: Date
}