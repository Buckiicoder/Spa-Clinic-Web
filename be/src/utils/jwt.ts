import jwt from 'jsonwebtoken'
import { UserRole } from '../types/user.js'

const SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  id: number
  role: UserRole
}

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })

export const verifyToken = (token: string) =>
  jwt.verify(token, SECRET) as JwtPayload
