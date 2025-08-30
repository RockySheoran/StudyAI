import { Request, Response } from "express";
import { UserModel } from "../Models/UserModel";
export interface AuthRequest extends Request {
  user?: {
    id:string,
    email:string,
  }
}
export const getProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }


  try {
       const user = await UserModel.findById(req.user.id);
    if (!user) {
    
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    console.log("user:", user);
    const userData = {
      name : user.name,
      email : user.email,
      avatar : user.profile,
    }
    return res.status(200).json({
      success: true,
      user: userData,
    });

  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};