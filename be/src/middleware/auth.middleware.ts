import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.js'

export interface AuthRequest extends Request {
  user?: {
    id: number
    role: string
  }
}

export const authCustomerMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.customerAccessToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyToken(token);

    if (decoded.role !== "CUSTOMER") {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authStaffMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.staffAccessToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyToken(token);

    if (decoded.role !== "STAFF" && decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const optionalAuthCustomer = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return next();

    // verify token (giống authCustomerMiddleware)
    const decoded = verifyToken(token); // dùng hàm của bạn

    req.user = decoded;
    next();
  } catch (err) {
    next(); // không chặn
  }
};
