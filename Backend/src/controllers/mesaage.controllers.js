import Message from "../models/message.model.js";
import User from "../models/User.model.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";


export const getAllcontacts = async (req,res) => {

    try {

        const loggedInuser = req.user._id
        const filteroutLoggedinuser = await User.find({ _id: { $ne: loggedInuser } }).select("-Password");
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

        if (!reciverId) {
            return res.status(400).json({ error: "Receiver ID is required" });
        }

        if (senderId.toString() === reciverId.toString()) {
            return res.status(400).json({ error: "You cannot send a message to yourself" });
        }

        const hasText = typeof text === "string" && text.trim().length > 0;
        if (!hasText && !image) {
            return res.status(400).json({ error: "Message cannot be empty" });
        }
    
        let imageUrl;
        if (image) {
            const cloudinaryImageupload = await cloudinary.uploader.upload(image);
            imageUrl = cloudinaryImageupload.secure_url
        }
    
        const newMessage = new Message({
            senderId:senderId,
            receiverId:reciverId,
            text: hasText ? text.trim() : "",
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


export const getChatpartners = async(req,res) => {

    try {
        //find all the user where logged in user is either sender or reciever and then we will get the chat partner id and then we will find the chat partner details and send it to the frontend
        
    
        const loggedInuser = req.user?._id || req.user_id

        if (!loggedInuser) {
            return res.status(401).json({ message: "Unauthorized: user not found" });
        }
    
        const message = await Message.find(
            {
                $or:[{senderId:loggedInuser},{receiverId:loggedInuser}]
            }
        )

        if (!message || message.length === 0) {
            return res.status(404).json({ message: "No chats found" });
        }
    
    
        const chatPartnerId = [
            ...new Set(message.map((msg) => {
            if (msg.senderId.toString() === loggedInuser.toString()) {
                return msg.receiverId.toString();
            } else {
                return msg.senderId.toString();
            }
        }))]
    
        const chatPartners = await User.
        find(
            { _id: { 
                $in: chatPartnerId
             } 
            }
        )
        .select("-Password")

        if (!chatPartners || chatPartners.length === 0) {
            return res.status(404).json({ message: "No chat partners found" });
        }

        res.status(200).json(chatPartners)

    } catch (error) {
        console.log("error in get getchatparteners",error.message);
        res.status(500).json({message:"cant fetch chatpartners"})
        
    }

}