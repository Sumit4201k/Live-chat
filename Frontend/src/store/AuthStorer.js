import {create} from 'zustand';
import {axiosInstance} from '../lib/axios'
import toast from 'react-hot-toast';

export const useAuthStore = create((set)=>({
    authuser: null,
   isAuthenticated:true,
   isSigningUp:false,
   isLoginIn:false,

   AuthCheck : async( )=>{

    try {
        const res = await axiosInstance.get("/auth/check");
        set({authuser:res.data})
    
       }
    catch (error) {
        console.log("error in Authcheck",error);
        set ({authuser:null})
    }finally {
        set({isAuthenticated:false})
    }
   },

   signup: async(data)=>{
    set({isSigningUp:true})
    try {
        const res =  await axiosInstance.post("/auth/signUp",data)
        set({authuser:res.data})
    } catch (error) {
        console.log("error in signing up");
        console.error(error.response.data.message);
        toast.error(error.response.data.message)     
        
    }finally{
        set({isSigningUp:false})
    }
   },

   login: async(data)=>{
    set({isLoginIn:true})
    try {
        const res =  await axiosInstance.post("/auth/login",data)
        set({authuser:res.data})
         toast.success("Logged in successfully");
    } catch (error) {
        console.log("error in logging in");
        console.error(error.response.data.message);
        toast.error(error.response.data.message)     
        
    }finally{
        set({isLoginIn:false})
    }
   },

    logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authuser: null });
      toast.success("Logged out successfully");
    
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  //TODO: add update profile here
  //TODO: page header and file handling and useref hook use and lern 
  //TODO: add update password here as a future enhancement
}))