import express from "express"
import { SignUp } from "../Controllers/SignUp";
import { Login } from "../Controllers/Login";
import { Google_Github_login, Login_callback } from "../Controllers/Google_Github_login";
import { getProfile } from "../Controllers/getMe";
import { middleware } from "../Middlewares/Auth.middleware";
import { Forgot_Password } from "../Controllers/Forgot-Password";
import { Reset_Password } from "../Controllers/Reset-Password";
import { Logout } from "../Controllers/Logout";
export const AuthRoute = express.Router();

AuthRoute.post("/signUp", SignUp)
AuthRoute.post("/login", Login)
AuthRoute.get('/login/:provider', Google_Github_login);
AuthRoute.get('/callback', Login_callback);
AuthRoute.get("me",middleware,getProfile)
AuthRoute.post("/forgot-password", Forgot_Password);   
AuthRoute.post("/reset-password", Reset_Password);   
AuthRoute.post("/logout",middleware,Logout);









