import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
dotenv.config()
import AuthRouter from "./routes/auth.route.js";
import MessageRouter from "./routes/message.route.js";
import path from "path"
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import cors from "cors"



const app = express();
const __dirname = path.resolve()


const PORT = ENV.PORT || 3000;
console.log( PORT , ENV.NODE_ENV);

//middlewares 
app.use(express.json({limit: "16kb" }))
app.use(cookieParser())
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}))

//routes 

app.use("/api/auth" , AuthRouter)
app.use("/api/message",MessageRouter)

if (ENV.NODE_ENV === "production") {

    app.use(express.static(path.join(__dirname,"../Frontend/dist")))

    app.get("*",(_,res) =>{
        res.sendFile(path.join(__dirname,"../Frontend","dist","index.html"))
    })
    
}

connectDB().then(()=>{

    app.listen(PORT,()=>{
       
        console.log(`app is rnning in ${PORT}`);
        
    })
})