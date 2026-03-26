import jwt from 'jsonwebtoken'
import { UserRole } from '../types/user.js'

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

const SECRET = process.env.JWT_SECRET;

export interface JwtPayload {
  id: number
  role: UserRole
}

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, SECRET, {
    expiresIn: "1d"
  })

export const verifyToken = (token: string) =>
  jwt.verify(token, SECRET) as JwtPayload
