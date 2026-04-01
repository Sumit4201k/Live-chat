import { rsendEmail, sender } from "../lib/resend.js"
import { createWelcomeEmailTemplate } from "./emailTemplate.js"
import "dotenv/config"


export const sendWelcomeemail = async (email,name,clientURL)=> {

    const{data , error}= await rsendEmail.emails.send
    ({
        from:`${sender.name} <${sender.email}>`,
        to:email,
        subject:"WELCOME TO MY LIVE CHAT APP",
        html:createWelcomeEmailTemplate(name,clientURL)
    })

    if (error) {
        console.error("ERROR IN EMAIL HADLER",error);
        throw new error("FAILED TO SEND EMAIL")
        
    }

    console.log("welcome email send sucessfill ",data);
    
}