import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";


export const arcjetProtection = async(req,res,next)=>{


try {
    const decison  =await aj.protect(req);

    if (decison.isDenied()) {
        if (decison.reason.isRateLimit()) {
            return res.status(429).json({message:"rate limit exeded"})
        } else if (decison.reason.isBot()){
            return res.status(403).json({message:"bot acess denied"})
        } else {
            return res.status(403).json({message:"acess denied by security policy"})
        }
    }
//check dor spoof bots
if (decison.results.some(isSpoofedBot)) {
return res.status(400).json({message:"spoofbot detected"})
}
next()
} catch (error) {
    console.log("error in arcjet middleware")
    next()
}

}