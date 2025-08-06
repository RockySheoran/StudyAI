import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  email: string;
}
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend the standard Request interface to include the authorization header
interface AuthenticatedRequest extends Request {
  headers: {
    authorization?: string;
  } & Request['headers'];
  cookies: {
    token?: string;
  };
  user?: {
    id: string;
    email: string;
  };
}

export const middleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
  let token: string | undefined;

  // Check multiple potential token locations
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    console.log(token);
  } 
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  console.log("Extracted token:",token); // Debug log

  if (!token) {
    console.log("Token not found in any of the expected locations");
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    console.log("req.user:", req.user);
    next();
  } catch (err) {
    console.log("token not found",err);
      return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};