export interface UserModel {
  id: number
  email: string
  password: string
  full_name: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER'
  created_at: Date
}
