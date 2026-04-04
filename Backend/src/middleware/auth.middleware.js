import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/User.model.js";

export const protect = async (req , res , next)=>{

    try {
        
       const Token = await req.cookies.jwt;
       if (!Token) {
        res.status(401).json({message:"unauthorized -token unaviaalble"})
       }

       const decode =  jwt.verify(Token , ENV.JWT_SECRET)
       if (!decode) {
        res.status(401).json({message:"unauthorized - invalid token"})
       }

       const user = await User.findById(decode.userId).select("-Password")
       if (!user) {
        console.log("user not found in protect");
        
        res.status(400).json({message:"user not found"})
       }

       req.user = user

       next()
    } catch (error) {
        
        res.status(400).json({message:"error in protect"})
    }
}