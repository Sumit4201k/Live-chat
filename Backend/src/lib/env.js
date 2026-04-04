import "dotenv/config";

export const ENV = {

    PORT: process.env.PORT,
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    RESEND_API: process.env.RESEND_API,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}


;

/**PORT=3000
MONGODB_URL=mongodb+srv://kamtisumit685:Sumit6856@cluster0.kaslqo1.mongodb.net/live-chat-app?retryWrites=true&w=majority
JWT_SECRET=jetdcebry

NODE_ENV=development

RESEND_API=re_Zw7HCVbR_4MiaxFsgnM9p3fokT8GS5ETV

EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME="K.SUMIT" */