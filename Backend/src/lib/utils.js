import jwt from "jsonwebtoken" ;
import { ENV } from "./env.js";


export const generateToken = async (userId, res) => {
    const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
        expiresIn: "7d"
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 days in milliseconds
        httpOnly: true,                            // Prevent XSS
        sameSite: isProduction ? "none" : "lax",   // Cross-domain cookie support in production
        secure: isProduction                       // Force secure cookie (HTTPS) in production
    });
    return token;
}