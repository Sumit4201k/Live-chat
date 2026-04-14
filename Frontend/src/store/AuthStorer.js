import {create} from 'zustand';

export const useAuthStore = create((set)=>({

    IsloggedIn:false,

    Login:()=>{
        console.log("we are logged in");
        set({IsloggedIn:true})
        
    }
}))