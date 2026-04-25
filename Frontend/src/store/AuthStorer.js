import { create } from 'zustand';
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast';
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/"

export const useAuthStore = create((set, get) => ({
  authuser: null,
  isAuthenticated: true,
  isSigningUp: false,
  isLoginIn: false,
  socket: null,
  onlineUsers: [],

  AuthCheck: async () => {

    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authuser: res.data.user })
      get().connectSocket();

    }

    catch (error) {
      if (error?.response?.status !== 401) {
        console.log("error in Authcheck", error);
      }
      set({ authuser: null })
      get().disconnectSocket();
    } finally {
      set({ isAuthenticated: false })
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post("/auth/signUp", data)
      set({ authuser: res.data })
      get().connectSocket();
    } catch (error) {
      console.log("error in signing up");
      const errorMessage = error.response?.data?.message || "Signup failed";
      console.error(errorMessage);
      toast.error(errorMessage)

    } finally {
      set({ isSigningUp: false })
    }
  },

  login: async (data) => {
    set({ isLoginIn: true })
    try {
      const res = await axiosInstance.post("/auth/login", data)
      set({ authuser: res.data })
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      console.log("error in logging in");
      const errorMessage = error.response?.data?.message || "Login failed";
      console.error(errorMessage);
      toast.error(errorMessage)

    } finally {
      set({ isLoginIn: false })
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authuser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket()

    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile-picture", data);
      set({ authuser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    }
  },

  connectSocket: () => {
    const { authuser } = get();
    if (!authuser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true //this ensures cookies are sent with connections
    });

    socket.connect();

    set({ socket })

    //listen for online user event 
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds })
    })
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  }

  //TODO: add update password here as a future enhancement
}))