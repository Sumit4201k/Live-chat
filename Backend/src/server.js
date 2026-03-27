import express from "express";
import dotenv from "dotenv"
import AuthRouter from "./routes/auth.route.js";
import path from "path"

dotenv.config()
import { connectDB } from "./lib/db.js";

const app = express();
const __dirname = path.resolve()

const PORT = process.env.PORT || 3000;

console.log( PORT , process.env.NODE_ENV);

app.use("/api/auth" , AuthRouter)

if (process.env.NODE_ENV === "production") {

    app.use(express.static(path.join(__dirname,"../Frontend/dist")))

    app.get("*",(_,res) =>{
        res.sendFile(path.join(__dirname,"../Frontend","dist","index.html"))
    })
    
}

app.listen(PORT,()=>{
    connectDB();
    console.log(`app is rnning in ${PORT}`);
    
})