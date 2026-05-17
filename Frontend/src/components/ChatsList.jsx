import React, { useEffect } from 'react'
import { chatAuthstore } from '../store/chatAuthstore'
import UserLoadingSkeleton from './UserLoadingSkeleton'
import NoChatsFound from './noChatsFound'
import { useAuthStore } from '../store/AuthStorer'

function ChatsList() {
  const { chats , isUserLoading ,getMyChatParteners , setSelectedUser, unreadByUser } =  chatAuthstore()
  const {onlineUsers} = useAuthStore()
  useEffect(()=>{getMyChatParteners()},[getMyChatParteners])

if (isUserLoading) return <UserLoadingSkeleton/>
if (chats.length === 0) return <NoChatsFound/>

  return (
   <>
      {chats.map((chat) => (
        (() => {
          const displayName = chat.fullName || chat.Fullname || chat.Email;
          const unreadCount = unreadByUser[chat._id?.toString?.() || String(chat._id)] || 0;

          return (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
            <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={displayName} />
              </div>
            </div>
            <h4 className={`truncate ${unreadCount > 0 ? "text-white font-semibold" : "text-slate-200 font-medium"}`}>{displayName}</h4>
            </div>

            {unreadCount > 0 && (
              <span className="min-w-6 h-6 rounded-full bg-cyan-500 px-2 text-xs font-bold text-white grid place-items-center shrink-0">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
          );
        })()
      ))}
    </>
  )
}

export default ChatsList
