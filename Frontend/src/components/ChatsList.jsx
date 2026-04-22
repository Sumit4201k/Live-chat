import React, { useEffect } from 'react'
import { chatAuthstore } from '../store/chatAuthstore'
import UserLoadingSkeleton from './UserLoadingSkeleton'
import NoChatsFound from './noChatsFound'

function ChatsList() {
  const { chats , isUserLoading ,getMyChatParteners , setSelectedUser } =  chatAuthstore()

  useEffect(()=>{getMyChatParteners()},[getMyChatParteners])

if (isUserLoading) return <UserLoadingSkeleton/>
if (chats.length === 0) return <NoChatsFound/>

  return (
   <>
      {chats.map((chat) => (
        (() => {
          const displayName = chat.fullName || chat.Fullname || chat.Email;

          return (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div className='avatar online'>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={displayName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{displayName}</h4>
          </div>
        </div>
          );
        })()
      ))}
    </>
  )
}

export default ChatsList
