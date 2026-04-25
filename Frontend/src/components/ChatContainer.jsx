import React, { useEffect, useRef } from 'react'
import { chatAuthstore } from '../store/chatAuthstore'
import { useAuthStore } from '../store/AuthStorer'
import ChatHeader from './chatHeader'
import NoChatHistoryPlaceHolder from './noChatHistoryPlaceHolder'
import MessageLoadingSkeleton from './MessageLoadingSkeleton'
import MessageInput from './MessageInput'

function ChatContainer() {

  const { messages, selectedUser, getMessagesByUserId, isMessageLoading, subscribeToMessages, unsubscribeToMessages } = chatAuthstore()
  const { authuser } = useAuthStore()
  const selectedUserName = selectedUser?.fullName || selectedUser?.Fullname || selectedUser?.Email || 'User'

  const messageEndRef = useRef(null)
  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessagesByUserId(selectedUser._id)
    subscribeToMessages()

    //clean up

    return () => unsubscribeToMessages()
  }, [getMessagesByUserId, selectedUser?._id, subscribeToMessages, unsubscribeToMessages])
  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])


  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessageLoading ? (
          <div>
            {messages.map((msg) => (
              <div key={msg._id}
                className={`chat ${msg.senderId === authuser._id ? "chat-end" : "chat-start"}`}>
                <div
                  className={`chat-bubble relative ${msg.senderId === authuser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                    }`}>
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ))}

            <div ref={messageEndRef} />

          </div>
        ) : isMessageLoading ? (<MessageLoadingSkeleton />) : (
          <NoChatHistoryPlaceHolder name={selectedUserName} />
        )}
      </div>
      <MessageInput />
    </>
  )
}

export default ChatContainer
