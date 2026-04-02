import { Resend } from "resend";
import { ENV } from "./env.js";

export const rsendEmail = new Resend(ENV.RESEND_API)

export const sender = {
    email:ENV.EMAIL_FROM,
    name:ENV.EMAIL_FROM_NAME
}