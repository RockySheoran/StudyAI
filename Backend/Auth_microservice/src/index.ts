import express,{Request,Response} from "express"
import dotenv  from "dotenv"
dotenv.config();
import { AuthRoute } from "./Routes/Auth.Routes";
import { errorHandler, notFoundHandler } from "./Middlewares/errorMiddleware";
import { supabase } from "./Config/supabaseClient";
import cors from "cors";

 // call the function of express
const app = express();

// Port 

const Port = process.env.PORT;

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));


// cores integration
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
}))



// auth Route use

app.use ("/auth",AuthRoute)

app.get("/" , (req :Request , res : Response)=>{
    return res.send("hello sever is running")
})

// 404 handler (must be after all other routes)
app.use(notFoundHandler);

// Error handler (must be last middleware)
app.use(errorHandler);




app.listen(Port , ()=>{
    console.log(`server run on the port http://localhost:${Port}`)
})

