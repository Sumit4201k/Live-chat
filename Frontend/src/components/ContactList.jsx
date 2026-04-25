import React, { useEffect } from 'react'
import { chatAuthstore } from '../store/chatAuthstore'
import UserLoadingSkeleton from './UserLoadingSkeleton'
import { useAuthStore } from '../store/AuthStorer'

function ContactList() {
  const {allContacts,getMyContacts,isUserLoading,setSelectedUser} = chatAuthstore()
   const {onlineUsers} = useAuthStore()

  useEffect(()=>{getMyContacts()},[getMyContacts])

if (isUserLoading) return <UserLoadingSkeleton/>


  return (
    <>
      {allContacts.map((contact) => {
        const displayName = contact.fullName || contact.Fullname || contact.Email;

        return (
          <div
            key={contact._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => setSelectedUser(contact)}
          >
            <div className="flex items-center gap-3">
              <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
                <div className="size-12 rounded-full">
                  <img src={contact.profilePic || "/avatar.png"} alt={displayName} />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium truncate">{displayName}</h4>
            </div>
          </div>
        );
      })}
    </>
  )
}



export default ContactList
