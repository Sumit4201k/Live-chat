import express from "express";
import { login, logout, signUp ,  updateProfilePicture } from "../controllers/auth.controllers.js";
import { protect } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const Router = express.Router();

// Router.use(arcjetProtection)

Router.post("/signup",signUp)

Router.post("/login",login)

Router.post("/logout",logout)

//protected routes 

Router.put("/update-profile-picture",protect,updateProfilePicture)
Router.get("/check",protect,(req,res)=>res.status(200).json({user:req.user}))

export default Router;