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
    isProfilePanelOpen:false,
    unreadByUser:{},
    totalUnreadCount:0,
    isUserLoading:false,
    isMessageLoading:false,
    isSoundEnabled:localStorage.getItem("isSoundEnabled") !== "false",

    toggleSound : ( )=>{
      const nextValue = !get().isSoundEnabled;
      localStorage.setItem("isSoundEnabled", String(nextValue))
      set({isSoundEnabled:nextValue})
    },


    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => set((state) => {
      const selectedUserId = selectedUser?._id?.toString?.();

      if (!selectedUserId) {
        return { selectedUser };
      }

      const unreadForSelectedUser = state.unreadByUser[selectedUserId] || 0;
      if (!unreadForSelectedUser) {
        return { selectedUser };
      }

      const nextUnreadByUser = { ...state.unreadByUser };
      delete nextUnreadByUser[selectedUserId];

      return {
        selectedUser,
        unreadByUser: nextUnreadByUser,
        totalUnreadCount: Math.max(0, state.totalUnreadCount - unreadForSelectedUser),
      };
    }),
    openProfilePanel: () => set({ isProfilePanelOpen: true }),
    closeProfilePanel: () => set({ isProfilePanelOpen: false }),
    clearNotifications: () => set({ unreadByUser: {}, totalUnreadCount: 0 }),


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

  updatePassword: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/change-password", data)
      toast.success(res.data.message || "Password updated successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password")
      throw error
    }
  },

  sendMessage:async(messageData)=>{
    // set({isMessageLoading:true})
    const {selectedUser , messages} = get()
     const {authuser} = useAuthStore.getState()

     if (!authuser?._id) {
      toast.error("Please log in again to send messages")
      return
     }

     if (!selectedUser?._id) {
      toast.error("Please select a chat first")
      return
     }
    
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
      toast.error(error.response?.data?.message || error.response?.data?.error || "Something went wrong");

    } 
    // finally {
    //     set({isMessageLoading:false})
    // }
  },

    subscribeToMessages: () => {
     const socket = useAuthStore.getState().socket;
     if (!socket) return;

     socket.off("newMessage");
     socket.on("newMessage", (newMessage) => {
       const authUserId = useAuthStore.getState().authuser?._id;
       if (!authUserId) return;

       const senderId = newMessage?.senderId?.toString?.() || String(newMessage?.senderId || "");
       const receiverId = newMessage?.receiverId?.toString?.() || String(newMessage?.receiverId || "");
       const activeUserId = get().selectedUser?._id?.toString?.() || String(get().selectedUser?._id || "");

       const isIncomingMessage = senderId !== String(authUserId) && receiverId === String(authUserId);
       if (!isIncomingMessage) return;

       const isForActiveChat = activeUserId && senderId === activeUserId;

       set((state) => {
        const senderIndex = state.chats.findIndex((chat) => String(chat._id) === senderId);
        const reorderedChats = senderIndex > 0
          ? [state.chats[senderIndex], ...state.chats.slice(0, senderIndex), ...state.chats.slice(senderIndex + 1)]
          : state.chats;

        if (isForActiveChat) {
          return {
            chats: reorderedChats,
            messages: [...state.messages, newMessage],
          };
        }

        const previousUnread = state.unreadByUser[senderId] || 0;

        return {
          chats: reorderedChats,
          unreadByUser: {
            ...state.unreadByUser,
            [senderId]: previousUnread + 1,
          },
          totalUnreadCount: state.totalUnreadCount + 1,
        };
       });

      if (!isForActiveChat) {
        const state = get();
        const senderUser =
          state.chats.find((chat) => String(chat._id) === senderId) ||
          state.allContacts.find((user) => String(user._id) === senderId);

        const senderName = senderUser?.fullName || senderUser?.Fullname || senderUser?.Email || "New message";
        const messagePreview = (newMessage?.text && newMessage.text.trim()) || (newMessage?.image ? "Sent a photo" : "New message");

        toast(`${senderName}: ${messagePreview}`, {
          duration: 2500,
          position: "top-right",
        });
      }

      if (!isForActiveChat && get().isSoundEnabled) {
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