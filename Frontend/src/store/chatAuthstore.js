import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const chatAuthstore = create((set,get)=>({
    allContacts:[],            //to get all contacts
    chats:[],                 //for chat parteners
    messages:[],              //messages of user after slecting a chat messasge 
    chats:"chats",              //what chat section is gona be active in page 
    selectedUser:null,
    isUserLoading:false,
    isMessageLoading:false,
    isSoundEnabled:localStorage.getItem("isSoundEnabled") === "true",

    toggleSound : ( )=>{
        localStorage.setItem("isSoundEnable",!get().isSoundEnabled)
        set({isSoundEnabled:!get().isSoundEnabled})
    }

})) 