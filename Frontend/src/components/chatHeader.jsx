import React, { useEffect } from 'react'
import { chatAuthstore } from '../store/chatAuthstore'
import { XIcon } from 'lucide-react'
import { useAuthStore } from '../store/AuthStorer'

function chatHeader() {

    const {selectedUser , setSelectedUser} = chatAuthstore()
    const { onlineUsers } = useAuthStore()

  const isOnline = onlineUsers.includes(selectedUser?._id)

  const displayName = selectedUser?.fullName || selectedUser?.Fullname || selectedUser?.Email || 'User'

    useEffect(()=>{
        const handleEsckey = (event)=>{
            if(event.key==="Escape") setSelectedUser(null);

        }

        window.addEventListener("keydown",handleEsckey)

        return ()=> window.removeEventListener("keydown",handleEsckey)

    },[setSelectedUser])

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 px-4 py-3 md:px-6"
    >
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-10 md:w-12 rounded-full">
            <img src={selectedUser?.profilePic || "/avatar.png"} alt={displayName} />
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-slate-200 font-medium truncate">{displayName}</h3>
          <p className="text-slate-400 text-xs md:text-sm">{isOnline ? "online" : "offline"}</p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  )
}

export default chatHeader
