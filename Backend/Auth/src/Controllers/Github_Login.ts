import { Request, Response } from "express";
import { generateToken } from "../Utils/generateToken";
import { UserModel } from "../Models/UserModel";


export const Github_Login  = async (req: Request, res: Response): Promise<any> => {
    
    const {name,email,authId,profile} = req.body;

    try {
        const findUser = await UserModel.findOne({email:email})
        
        if(!findUser){
            const user = await UserModel.create({
                name: name,
                email: email,
                profile: profile,
                provider: ["github"],
            })
            const token = generateToken({ email: email, id: user?._id.toString() });
            const cookieOptions = {
                secure: true, // Always true for production HTTPS
                
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/',
            };
            res.cookie('token', token, {
                ...cookieOptions,
                httpOnly: true,
            });

            const userData = {
                id: user?._id.toString(),
                email: user?.email,
                name: user?.name,
                accessToken: token,
                profile: user?.profile,
            }
            console.log("userData:", userData);
            return res.status(200).json({ message: "Login successful", userData });
        }

        const NewuserData = await UserModel.findOneAndUpdate(
            {email:email},
            {
                $addToSet: { provider: "github" },
                profile:profile,
                name:name
            },
            { new: true }
        )
        
        const token = generateToken({ email: email, id: findUser?._id.toString() });
        const cookieOptions = {
            secure: true, // Always true for production HTTPS
            sameSite: 'none' as const, // Required for cross-domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        };
        res.cookie('token', token, {
            ...cookieOptions,
            httpOnly: true,
        });
    
        const userData = {
            id: NewuserData?._id.toString(),
            email: NewuserData?.email,
            name: NewuserData?.name,
            accessToken: token,
            profile: NewuserData?.profile,
        }
        return res.status(200).json({ message: "Login successful", userData });
    
    }catch (error) {
        return res.status(500).json({message:"Internal server error",error});
    }
}


    

