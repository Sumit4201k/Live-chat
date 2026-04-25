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
      const nextValue = !get().isSoundEnabled;
      localStorage.setItem("isSoundEnabled", String(nextValue))
      set({isSoundEnabled:nextValue})
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
        const res = await axiosInstance.post(`/message/send/${selectedUser._id}`,messageData)
        set((state) => ({
            messages: state.messages.map((msg) =>
              msg._id === tempId ? res.data : msg
            ),
        }))
    } catch (error) {
        set({messages: messages}) // Remove optimistic message on error
        toast.error(error.response?.data?.message || "Something went wrong");

    } 
    // finally {
    //     set({isMessageLoading:false})
    // }
  },

    subscribeToMessages: () => {
      const { selectedUser } = get();
     if (!selectedUser?._id) return;

     const socket = useAuthStore.getState().socket;
     if (!socket) return;

     socket.off("newMessage");
     socket.on("newMessage", (newMessage) => {
       const activeUserId = get().selectedUser?._id;
       if (!activeUserId) return;

       const isMessageFromOrToSelectedUser =
        newMessage?.senderId === activeUserId ||
        newMessage?.receiverId === activeUserId;

       if (!isMessageFromOrToSelectedUser) return;

       const currentMessages = get().messages;
       set({ messages: [...currentMessages, newMessage] });

      if (get().isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0; // reset to start
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
       }
    });

  },

  unsubscribeToMessages: ()=>{
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage")
  }


    

})) 