import { Resend } from "resend";
import "dotenv/config"

export const rsendEmail = new Resend(process.env.RESEND_API)

export const sender = {
    email:process.env.EMAIL_FROM,
    name:process.env.EMAIL_FROM_NAME
}