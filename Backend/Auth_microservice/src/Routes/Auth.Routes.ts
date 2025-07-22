import express from "express"
import { SignUp } from "../Controllers/Auth/SignUp";
import { Login } from "../Controllers/Auth/Login";

export const AuthRoute = express.Router();

AuthRoute.post("/signUp", SignUp)
AuthRoute.post("/login", Login)








