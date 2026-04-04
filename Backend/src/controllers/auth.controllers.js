import { sendWelcomeemail } from "../emails/emailHandler.js";
import cloudinary from "../lib/cloudinary.js";
import { ENV } from "../lib/env.js";
import { generateToken } from "../lib/utils.js"
import User from "../models/User.model.js";
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
            const savedUser = await newUser.save();
            generateToken(newUser._id,res)

            res.status(201).json(
                {

                    _id:newUser._id,
                    Fullname :newUser.Fullname,
                    Email:newUser.Email.toLowerCase(),
                    profilePic:newUser.profilePic

                }
            )

            try {
                await sendWelcomeemail(savedUser.Email,savedUser.Fullname,ENV.CLIENT_URL)
            } catch (error) {
                console.log("FAILED TO SEND EMAIL IN AUTH");
                
            }

        } else {

            res.status(400).json({message:"invalid user data "})
        }
    } catch (error) {
        console.error("SIGNUP ERROR:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });;
    }


}

export const login = async (req,res)=>{
    const {Email , Password} = req.body;

    try {
        const user =  await User.findOne({Email})
        if (!user) {
            
          return  res.status(400).json("invalid credentials")

        }

        const isPasswordcorrect = await bcrypt.compare(Password,user.Password)
        if(!isPasswordcorrect) {
           return res.status(400).json("invalid credentials p")
        }

        generateToken(user._id,res)

        res.status(400).json(
            {
                    _id:user._id,
                    Fullname :user.Fullname,
                    Email:user.Email.toLowerCase(),
                    profilePic:user.profilePic
            }
        )



    } catch (error) {
        console.error("LOGIN ERROR:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}

export const logout = async (req,  res )=>{

    res.cookie("jwt","",{maxAge:0})
 return res.status(200).json({message:"logOut sucess fully"})
}

export const updateProfilePicture = async (req,res) =>{

    try {
        const {profilePicture} = req.body
        if (!profilePicture) {
            req.status(400).json({message:"profile pic not uploaded"})
        }
    
        const userID = req.user._id
    
        const uplodedProfilepic  = await cloudinary.uploader.upload(profilePicture)
        
        const user = User.findByIdAndUpdate(userID,{
            profilePic:uplodedProfilepic.secure_url
        },{new:true}).select(-Password)

        res.status(200).json({user})
    
    } catch (error) {
        res.status(400).json("error in profile pic update")
    }

}