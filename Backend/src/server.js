import express from "express";
import dotenv from "dotenv"
import AuthRouter from "./routes/auth.route.js";
import path from "path"

dotenv.config(
    {
        path:'./env'
    }
)


import { connectDB } from "./lib/db.js";
import { json } from "stream/consumers";

const app = express();
const __dirname = path.resolve()


const PORT = process.env.PORT || 3000;
console.log( PORT , process.env.NODE_ENV);

//middlewares 
app.use(express.json({limit: "16kb" }))

//routes 

app.use("/api/auth" , AuthRouter)

if (process.env.NODE_ENV === "production") {

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