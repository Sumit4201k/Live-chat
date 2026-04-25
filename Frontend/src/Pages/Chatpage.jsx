import React from 'react'
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import ProfileHeader from '../components/ProfileHeader';
import ActiveTabSwitch from '../components/ActiveTabSwitch';
import ChatsList from '../components/ChatsList';
import ContactList from '../components/ContactList';
import ChatContainer from '../components/ChatContainer';
import NoConversationPlaceholder from '../components/NoConversationPlaceholder';

import { chatAuthstore } from '../store/chatAuthstore';

function chatpage() {
   const { activeTab, selectedUser } = chatAuthstore();

  return (
    <div className="relative w-full max-w-6xl h-[calc(100vh-2rem)] md:h-[800px]">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div
          className={`${selectedUser ? "hidden" : "flex"} md:flex w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex-col`}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className={`${selectedUser ? "flex" : "hidden"} md:flex flex-1 min-w-0 flex-col bg-slate-900/50 backdrop-blur-sm`}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}

export default chatpage
