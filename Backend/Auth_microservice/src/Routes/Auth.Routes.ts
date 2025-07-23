import express from "express"
import { SignUp } from "../Controllers/SignUp";
import { Login } from "../Controllers/Login";
import { Google_Github_login, Login_callback } from "../Controllers/Google_Github_login";
import { getProfile } from "../Controllers/Get_me";
import { middleware } from "../Middlewares/Auth.middleware";
export const AuthRoute = express.Router();

AuthRoute.post("/signUp", SignUp)
AuthRoute.post("/login", Login)
AuthRoute.get('/login/:provider', Google_Github_login);
AuthRoute.get('/callback', Login_callback);
AuthRoute.get("me",middleware,getProfile)









