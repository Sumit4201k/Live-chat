import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./AuthStorer";

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

  sendMessage:async(messageData)=>{
    // set({isMessageLoading:true})
    const {selectedUser , messages} = get()
     const {authuser} = useAuthStore.getState()
    
     const tempId = "temp-" + Date.now(); // Temporary ID for optimistic UI

        const optimisticMessage = {
            _id: tempId,
            senderId: authuser._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true, // Flag to identify optimistic messages
        };

        // Update UI optimistically
        set({ messages: [...messages, optimisticMessage] });
    try {
        const res = await axiosInstance.post(`/message/ send/${selectedUser._id}`,messageData)
        set({messages:messages.concat(res.data)})
    } catch (error) {
        set({messages: messages}) // Remove optimistic message on error
        toast.error(error.response?.data?.message || "Something went wrong");

    } 
    // finally {
    //     set({isMessageLoading:false})
    // }
  }


    

})) 