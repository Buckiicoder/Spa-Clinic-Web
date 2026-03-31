export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
  RECEPTION = 'RECEPTION',
}

export interface UserModel {
  id: number
  email: string
  password_hash: string
  full_name: string
  role: UserRole
  created_at: Date
}