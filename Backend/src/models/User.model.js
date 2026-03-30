import mongoose from "mongoose";

const  Userschema = new mongoose.Schema({
Email: {
    type:"String",
    unique:true,
    required:true
},
Fullname: {
    type:"string",
    required:true 
} ,
Password: {
    type:"String",
    required:true,
    minlength:6
},
profilePic: {

    type:"String",
    default:""
},

},{timestamps:true})

const User = mongoose.model("User",Userschema)

export default User;