import { Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";
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
       const { data, error } = await supabase.auth.admin.getUserById(req.user.id);
    if (error) {
      console.error('Failed to get user:', error);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    console.log("user:", data.user.user_metadata);
    const userData = {
      name : data.user.user_metadata.name,
      email : data.user.email,
      avatar : data.user.user_metadata.avatar_url,
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