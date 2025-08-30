import express, { Request, Response } from "express"
import dotenv from "dotenv"
dotenv.config();
import { AuthRoute } from "./Routes/Auth.Routes";

import { supabase } from "./Config/supabaseClient";
import cors from "cors";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit'
// call the function of express
const app = express();

// Port 

const Port = process.env.PORT;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet())


// CORS configuration for production deployment
app.use(cors({
    origin: [
        process.env.CLIENT_URL || "http://localhost:3000",
        "https://study-ai-assist.vercel.app", // Add your frontend domain
        /\.vercel\.app$/, // Allow all Vercel app domains
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
}))

// express rate limit 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    // store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)


// auth Route use

app.use("/api/auth", AuthRoute)

app.get("/", (req: Request, res: Response) => {
    return res.send("hello sever is running")
})


app.listen(Port, () => {
    console.log(`server run on the port http://localhost:${Port}`)
})

