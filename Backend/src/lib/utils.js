import jwt from "jsonwebtoken" ;
import { ENV } from "./env.js";


export const generateToken = async (userId, res) => {

    const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("jwt",token,{
        maxAge:7*24*60*60*100,  //milisecond
        httpOnly:true, //XSS
        sameSite:"strict", //CSRF atacks
        secure:false
    })
    return token;
}