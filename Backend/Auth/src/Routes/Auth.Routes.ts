import express from "express"
import { SignUp } from "../Controllers/SignUp";
import { Login } from "../Controllers/Login";
import { Google_Login } from "../Controllers/Google_login";
import { Github_Login } from "../Controllers/Github_Login";
import { getProfile } from "../Controllers/getMe";
import { middleware } from "../Middlewares/Auth.middleware";
import { Forgot_Password } from "../Controllers/Forgot-Password";
import { Reset_Password } from "../Controllers/Reset-Password";
import { Logout } from "../Controllers/Logout";
import { Verify_Email, Resend_Verification } from "../Controllers/Verify-Email";
export const AuthRoute = express.Router();

AuthRoute.post("/signUp", SignUp)
AuthRoute.post("/login", Login)
AuthRoute.post("/google-login", Google_Login);
AuthRoute.post("/github-login", Github_Login);
AuthRoute.get("/me",middleware,getProfile)
AuthRoute.post("/forgot-password", Forgot_Password);   
AuthRoute.post("/reset-password", Reset_Password);   
AuthRoute.get("/logout",middleware,Logout);
AuthRoute.get("/verify-email", Verify_Email);
AuthRoute.post("/resend-verification", Resend_Verification);









