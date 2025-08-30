import { Request , Response , NextFunction } from 'express';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key"

export interface JwtPayload {
  id: string;
  email: string;
}

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

  // Check authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookies
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
  console.log("token:b ehgbfyu", token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    console.log("req.user:", req.user);
    next();
  } catch (err) {
    console.log("err:", err);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

