import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./AuthStorer";
import { deriveChatKey, encryptMessage, decryptMessage } from "../lib/crypto";
import { saveMessageLocal, getLocalMessages, getLatestTimestamp } from "../lib/localDb";

export const chatAuthstore = create((set, get) => ({
  allContacts: [],            // to get all contacts
  chats: [],                 // for chat partners
  messages: [],              // messages of user after selecting a chat message 
  activeTab: "chats",        // what chat section is going to be active on page 
  selectedUser: null,
  activeChatKey: null,       // cached CryptoKey for active chat
  isProfilePanelOpen: false,
  unreadByUser: {},
  totalUnreadCount: 0,
  isUserLoading: false,
  isMessageLoading: false,
  isSoundEnabled: localStorage.getItem("isSoundEnabled") !== "false",

  toggleSound: () => {
    const nextValue = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", String(nextValue));
    set({ isSoundEnabled: nextValue });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: async (selectedUser) => {
    if (!selectedUser) {
      set({ selectedUser: null, activeChatKey: null, messages: [] });
      return;
    }

    const { authuser } = useAuthStore.getState();
    let derivedKey = null;
    if (authuser?._id) {
      try {
        derivedKey = await deriveChatKey(authuser._id, selectedUser._id);
      } catch (err) {
        console.error("Error deriving key on user selection:", err);
      }
    }

    set((state) => {
      const selectedUserId = selectedUser?._id?.toString?.();
      const nextUnreadByUser = { ...state.unreadByUser };
      let nextTotalUnread = state.totalUnreadCount;

      if (selectedUserId && state.unreadByUser[selectedUserId]) {
        nextTotalUnread = Math.max(0, state.totalUnreadCount - state.unreadByUser[selectedUserId]);
        delete nextUnreadByUser[selectedUserId];
      }

      return {
        selectedUser,
        activeChatKey: derivedKey,
        unreadByUser: nextUnreadByUser,
        totalUnreadCount: nextTotalUnread,
      };
    });

    // Pre-load locally cached messages first and initiate sync
    get().getMessagesByUserId(selectedUser._id);
  },

  openProfilePanel: () => set({ isProfilePanelOpen: true }),
  closeProfilePanel: () => set({ isProfilePanelOpen: false }),
  clearNotifications: () => set({ unreadByUser: {}, totalUnreadCount: 0 }),

  getMyContacts: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/message/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get contacts");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMyChatParteners: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/message/chatPartners");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get chat partners");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessageLoading: true });
    try {
      // 1. Fetch from browser IndexedDB cache first
      const cachedMessages = await getLocalMessages(userId);

      // Load/derive key
      let chatKey = get().activeChatKey;
      if (!chatKey) {
        const { authuser } = useAuthStore.getState();
        if (authuser?._id) {
          chatKey = await deriveChatKey(authuser._id, userId);
          set({ activeChatKey: chatKey });
        }
      }

      // Decrypt cached messages for UI state
      const decryptedCached = await Promise.all(
        cachedMessages.map(async (msg) => {
          if (msg.text && msg.text.length > 0) {
            try {
              const decrypted = await decryptMessage(msg.text, chatKey);
              return { ...msg, text: decrypted };
            } catch (err) {
              return msg; // Fallback if plain or decrypted fail
            }
          }
          return msg;
        })
      );

      // Render instantly
      set({ messages: decryptedCached });

      // 2. Fetch changes since the latest local message (Delta Sync)
      const lastTimestamp = await getLatestTimestamp(userId);
      const sinceQuery = lastTimestamp ? `?since=${encodeURIComponent(lastTimestamp)}` : "";

      const res = await axiosInstance.get(`/message/${userId}${sinceQuery}`);
      const newMessages = res.data;

      if (newMessages && newMessages.length > 0) {
        const decryptedNew = await Promise.all(
          newMessages.map(async (msg) => {
            let decryptedText = msg.text;
            if (msg.text && msg.text.length > 0) {
              try {
                decryptedText = await decryptMessage(msg.text, chatKey);
              } catch (err) {
                console.error("Failed to decrypt new incoming API message:", err);
              }
            }

            const decryptedMsg = { ...msg, text: decryptedText };

            // Save raw ciphertext message to IndexedDB
            await saveMessageLocal(msg, userId);

            return decryptedMsg;
          })
        );

        // Merge new messages with cached messages
        set((state) => {
          const existingIds = new Set(state.messages.map((m) => m._id));
          const filteredNew = decryptedNew.filter((m) => !existingIds.has(m._id));
          return { messages: [...state.messages, ...filteredNew] };
        });
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessageLoading: false });
    }
  },

  updatePassword: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/change-password", data);
      toast.success(res.data.message || "Password updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
      throw error;
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, activeChatKey } = get();
    const { authuser } = useAuthStore.getState();

    if (!authuser?._id) {
      toast.error("Please log in again to send messages");
      return;
    }

    if (!selectedUser?._id) {
      toast.error("Please select a chat first");
      return;
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

    // Update UI state optimistically
    set({ messages: [...messages, optimisticMessage] });

    try {
      let chatKey = activeChatKey;
      if (!chatKey) {
        chatKey = await deriveChatKey(authuser._id, selectedUser._id);
        set({ activeChatKey: chatKey });
      }

      // Encrypt before transmitting
      let cipherText = messageData.text;
      if (messageData.text && messageData.text.length > 0) {
        cipherText = await encryptMessage(messageData.text, chatKey);
      }

      const encryptedPayload = {
        ...messageData,
        text: cipherText,
      };

      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, encryptedPayload);
      const serverMessage = res.data; // Server returns ciphertext payload

      // Save raw ciphertext to IndexedDB
      await saveMessageLocal(serverMessage, selectedUser._id);

      const decryptedServerMsg = {
        ...serverMessage,
        text: messageData.text // restore plain text
      };

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? decryptedServerMsg : msg
        ),
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      set({ messages: messages }); // Rollback optimistic message on error
      toast.error(error.response?.data?.message || error.response?.data?.error || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", async (newMessage) => {
      const authUserId = useAuthStore.getState().authuser?._id;
      if (!authUserId) return;

      const senderId = newMessage?.senderId?.toString?.() || String(newMessage?.senderId || "");
      const receiverId = newMessage?.receiverId?.toString?.() || String(newMessage?.receiverId || "");
      const activeUserId = get().selectedUser?._id?.toString?.() || String(get().selectedUser?._id || "");

      const isIncomingMessage = senderId !== String(authUserId) && receiverId === String(authUserId);
      if (!isIncomingMessage) return;

      // Derive key for the sender of incoming message
      const chatKey = await deriveChatKey(authUserId, senderId);

      // Decrypt incoming message text
      let decryptedText = newMessage.text;
      if (newMessage.text && newMessage.text.length > 0) {
        try {
          decryptedText = await decryptMessage(newMessage.text, chatKey);
        } catch (err) {
          console.error("Failed to decrypt incoming message:", err);
        }
      }

      const decryptedMsg = { ...newMessage, text: decryptedText };

      // Save raw ciphertext to IndexedDB
      await saveMessageLocal(newMessage, senderId);

      const isForActiveChat = activeUserId && senderId === activeUserId;

      set((state) => {
        const senderIndex = state.chats.findIndex((chat) => String(chat._id) === senderId);
        const reorderedChats = senderIndex > 0
          ? [state.chats[senderIndex], ...state.chats.slice(0, senderIndex), ...state.chats.slice(senderIndex + 1)]
          : state.chats;

        if (isForActiveChat) {
          return {
            chats: reorderedChats,
            messages: [...state.messages, decryptedMsg],
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
        const messagePreview = (decryptedText && decryptedText.trim()) || (newMessage?.image ? "Sent a photo" : "New message");

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

    socket.off("rateLimitError");
    socket.on("rateLimitError", (data) => {
      toast.error(data.message || "Slow down! You are sending too many requests.");
    });
  },

  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("rateLimitError");
  }
}));