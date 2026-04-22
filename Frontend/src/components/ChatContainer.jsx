import React, { useEffect } from 'react'
import { chatAuthstore } from '../store/chatAuthstore'
import { useAuthStore } from '../store/AuthStorer'
import ChatHeader from './chatHeader'
import NoChatHistoryPlaceHolder from './noChatHistoryPlaceHolder'

function ChatContainer() {

  const {messages, selectedUser , getMessagesByUserId ,isMessageLoading} = chatAuthstore()
  const {authuser} = useAuthStore()
  const selectedUserName = selectedUser?.fullName || selectedUser?.Fullname || selectedUser?.Email || 'User'

  useEffect(()=>{getMessagesByUserId(selectedUser._id)},[getMessagesByUserId,selectedUser])

  return (
    <>
      <ChatHeader/>
      <div  className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 ? (
          <div>
            {messages.map((msg)=>(
              <div key={msg._id} 
               className={`chat ${msg.senderId === authuser._id ? "chat-end" : "chat-start"}`}>
                <div
                className={`chat-bubble relative ${
                    msg.senderId === authuser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}>
                  {msg.image &&  (
                    <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoChatHistoryPlaceHolder name={selectedUserName} />
        )}
      </div>
    </>
  )
}

export default ChatContainer
