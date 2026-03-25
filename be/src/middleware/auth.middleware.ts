import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.js'

export interface AuthRequest extends Request {
  user?: {
    id: number
    role: string
  }
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    
    /* Lấy token từ cookie (http) */
    const token = req.cookies?.accessToken
    
    if(!token) { 
      return res.status(401).json({ message: 'Unauthorized'})
    }

    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token'})
  }
}
