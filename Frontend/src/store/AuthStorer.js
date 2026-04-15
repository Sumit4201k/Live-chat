import {create} from 'zustand';
import {axiosInstance} from '../lib/axios'

export const useAuthStore = create((set)=>({
    authuser: null,
   isAuthenticated:true,

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
   }


}))