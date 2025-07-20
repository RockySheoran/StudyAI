import express,{Request,Response} from "express"
import dotenv  from "dotenv"
dotenv.config();


 // call the function of express
const app = express();

// Port 

const Port = process.env.PORT;


app.get("/" , (req :Request , res : Response)=>{
    return res.send("hello sever is running")
})




app.listen(Port , ()=>{
    console.log(`server run on the port http://localhost:${Port}`)
})
