import express from "express";
import dotenv from "dotenv"
dotenv.config()
import AuthRouter from "./routes/auth.route.js";
import path from "path"
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";




const app = express();
const __dirname = path.resolve()


const PORT = ENV.PORT || 3000;
console.log( PORT , ENV.NODE_ENV);

//middlewares 
app.use(express.json({limit: "16kb" }))

//routes 

app.use("/api/auth" , AuthRouter)

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