import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { ENV } from "../lib/env.js";
import { log } from "console";



export const socketAuthMiddleware = async (socket, next) => {
    //extract token from http-only cookie
    try {
        const token = socket
        .handshake.headers.cookie?.split("; ")
        .find((row) => row.startsWith("jwt="))?.split("=")[1];

        if(!token){
            console.log("socket connection failed ");
            return next(new Error("unauthorized - no token "))
            
        }

        //varify the token 
        const decoded = jwt.verify(token,ENV.JWT_SECRET);

        if (!decoded) {
            console.log("socket connection rejected :invalid token");
            return next(new Error("unsuthorized connection "))
            
        }

   // find the user fromdb
        const user = await User.findById(decoded.userId).select("-Password");
        if (!user) {
            console.log("Socket connection rejected: User not found");
            return next(new Error("User not found"));
        }
         
        socket.user=user;
        socket.userId=user._id.toString()

         console.log(`Socket authenticated for user: ${user.Fullname} (${user._id})`);


        next()
    } catch (error) {
        console.error("Socket authentication error:", error);
        return next(new Error("Authentication failed"));
    }
}