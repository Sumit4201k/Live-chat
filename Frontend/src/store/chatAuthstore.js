import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const chatAuthstore = create((set,get)=>({
    allContacts:[],            //to get all contacts
    chats:[],                 //for chat parteners
    messages:[],              //messages of user after slecting a chat messasge 
    activeTab:"chats",        //what chat section is gona be active in page 
    selectedUser:null,
    isUserLoading:false,
    isMessageLoading:false,
    isSoundEnabled:localStorage.getItem("isSoundEnabled") === "true",

    toggleSound : ( )=>{
        localStorage.setItem("isSoundEnable",!get().isSoundEnabled)
        set({isSoundEnabled:!get().isSoundEnabled})
    },


    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => set({ selectedUser }),


    getMyContacts:async()=>{
        set({isUserLoading:true})

        try {
            const res = await axiosInstance.get("/message/contacts")
            set({allContacts:res.data})
            
        } catch (error) {
            toast.error(error.response.data.message)
        }finally {
            set({isUserLoading:false})
        }
    },
    getMyChatParteners:async()=>{
        set({isUserLoading:true})

        try {
            const res = await axiosInstance.get("/message/chatPartners")
            set({chats:res.data})
            
        } catch (error) {
            toast.error(error.response.data.message)
        }finally {
            set({isUserLoading:false})
        }
    },

     getMessagesByUserId: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessageLoading: false });
    }
  },


    

})) 