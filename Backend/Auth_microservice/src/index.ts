import express, { Request, Response } from "express"
import dotenv from "dotenv"
dotenv.config();
import { AuthRoute } from "./Routes/Auth.Routes";

import { supabase } from "./Config/supabaseClient";
import cors from "cors";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// call the function of express
const app = express();

// Port 

const Port = process.env.PORT;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet())


// cores integration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))



// auth Route use

app.use("/api/auth", AuthRoute)

app.get("/", (req: Request, res: Response) => {
    return res.send("hello sever is running")
})


app.listen(Port, () => {
    console.log(`server run on the port http://localhost:${Port}`)
})

