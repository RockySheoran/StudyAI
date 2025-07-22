import express,{Request,Response} from "express"
import dotenv  from "dotenv"
import { AuthRoute } from "./Routes/Auth.Routes";
dotenv.config();


 // call the function of express
const app = express();

// Port 

const Port = process.env.PORT;


// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));


// auth Route use

app.use ("/api/auth",AuthRoute)



app.get("/" , (req :Request , res : Response)=>{
    return res.send("hello sever is running")
})





app.listen(Port , ()=>{
    console.log(`server run on the port http://localhost:${Port}`)
})
