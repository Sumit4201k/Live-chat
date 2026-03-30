import { generateToken } from "../lib/utils.js"
import User  from "../models/User.model.js"
import bcrypt from "bcryptjs"

export const signUp = async (req,res)=>{

    const{Fullname , Email , Password } = req.body;
    try {
    
            if (!Fullname?.trim()) {
        return res.status(400).json({ message: "Fullname is required" });
        }

        if (!Email?.trim()) {
        return res.status(400).json({ message: "Email is required" });
        }

        if (!Password?.trim()) {
        return res.status(400).json({ message: "Password is required" });
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
        const hashPassword = await bcrypt.hash(Password,salt)

        const newUser = new User({
            Fullname,
            Email: Email.toLowerCase(),
            Password:hashPassword
        })

        if (newUser) {
            await newUser.save();
            generateToken(newUser._id,res)

            res.status(201).json(
                {

                    _id:newUser._id,
                    Fullname :newUser.Fullname,
                    Email:newUser.Email.toLowerCase(),
                    profilePic:newUser.profilePic

                }
            )

        } else {

            res.status(400).json({message:"invalid user data "})
        }
    } catch (error) {
        console.error("SIGNUP ERROR:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });;
    }


}

// export const login = async (req,res)=>{
//     const {Email , Password} = req
//}