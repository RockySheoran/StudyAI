import express from "express"
import dotenv  from "dotenv"
dotenv.config();


 // call the function of express
const app = express();

// Port 

const Port = process.env.PORT;




app.listen(Port , ()=>{
    console.log(`server run on the port ${Port}`)
})
