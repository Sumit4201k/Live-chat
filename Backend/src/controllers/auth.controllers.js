import User  from "../models/User.model.js"
import bcrypt from "bcryptjs"

export const signUp = async (req,res)=>{

    try {
        const{Fullname , Email , Password } = req.body
    
        if (!Fullname && !Email && !Password) {
            
            res.send(400).json("all feilds are rquired ")
        }
    
         if (Password.length < 6) {
          return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
    
        // check if emailis valid: regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }

        const user = await User.findOne({Email})

        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt =  await bcrypt.genSalt(10)
        const hashPassword = bcrypt.hash(Password,salt)

        const newUser = new User({
            Fullname,
            Email,
            Password:hashPassword
        })

        if (newUser) {
            
        } else {

            res.status(400).json({message:"invalid user data "})
        }
    } catch (error) {
        return res.status(500).json({ message: "ERROR IN SIGN UP" });
    }


}