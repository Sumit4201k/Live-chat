import Message from "../models/message.model.js";
import User from "../models/User.model.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";


export const getAllcontacts = async (req,res) => {

    try {

        const loggedInuser = req.user._id
        const filteroutLoggedinuser = await User.find({ _id: { $ne: loggedInuser } }).select("-password");
        //ne=notequalto

        res.status(200).json(filteroutLoggedinuser)

    } catch (error) {
        console.log("error in getAllcontacts");
        res.status(400).json({Message:"error in  getting all the contacts"})
    }

    
}

export const getmessagesByuserId = async(req,res)=>{
 
    try {
        const myId = req.user._id
        const {id:userTochat} = req.params

        if (!userTochat) {
            return res.status(400).json({ error: "User ID is required" });
        }


    
        const message = await Message.find(
            {
            $or:[
            {senderId:myId,receiverId:userTochat},
            {senderId:userTochat , receiverId:myId}
        ]
        }
        )

        res.status(200).json(message)
    } catch (error) {
        
        console.log("error in get message by id");
        res.status(400).json("cant get id")
        
    }
}

export const sendmessage = async(req, res)=>{
try {
        const {image ,text} = req.body 
        const {id:reciverId} = req.params
        const senderId =  req.user._id
    
        let imageUrl;
        if (image) {
            const cloudinaryImageupload = await cloudinary.uploader.upload(image);
            imageUrl = cloudinaryImageupload.secure_url
        }
    
        const newMessage = new Message({
            senderId:senderId,
            receiverId:reciverId,
            text:text,
            image:imageUrl
        })
    
        await newMessage.save()
        res.status(200).json(newMessage)
} catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
}

    //TODO:want to add real time mesaage convo here when implementing socket io
}