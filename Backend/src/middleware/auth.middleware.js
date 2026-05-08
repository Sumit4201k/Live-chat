import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/User.model.js";

export const protect = async (req , res , next)=>{

    try {
       const Token = req.cookies?.jwt;
       if (!Token) {
       return res.status(401).json({message:"Unauthorized - token unavailable"})
       }

       const decode =  jwt.verify(Token , ENV.JWT_SECRET)
       if (!decode) {
        return res.status(401).json({message:"Unauthorized - invalid token"})
       }

       const user = await User.findById(decode.userId).select("-Password")
       if (!user) {
        console.log("user not found in protect");
        
        return res.status(401).json({message:"Unauthorized - user not found"})
       }

       req.user = user //whole user without password

       next()
    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Unauthorized - invalid or expired token" })
        }

        console.error("protect middleware error:", error.message)
        return res.status(500).json({message:"Internal server error in auth middleware"})
    }
}