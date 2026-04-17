import {create} from 'zustand';
import {axiosInstance} from '../lib/axios'
import toast from 'react-hot-toast';

export const useAuthStore = create((set)=>({
    authuser: null,
   isAuthenticated:true,
   isSigningUp:false,

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
   }


}))