import express from "express";
import dotenv from "dotenv"
import AuthRouter from "./routes/auth.route.js";

dotenv.config()

const app = express();

const PORT = process.env.PORT || 3000;

console.log( PORT);

app.use("/api/auth" , AuthRouter)

app.listen(PORT,()=>{

    console.log(`app is rnning in ${PORT}`);
    
})