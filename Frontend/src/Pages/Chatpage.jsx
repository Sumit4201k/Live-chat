import React, { useEffect } from 'react'
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import ProfileHeader from '../components/ProfileHeader';
import ActiveTabSwitch from '../components/ActiveTabSwitch';
import ChatsList from '../components/ChatsList';
import ContactList from '../components/ContactList';
import ChatContainer from '../components/ChatContainer';
import NoConversationPlaceholder from '../components/NoConversationPlaceholder';
import ProfileSettingsPanel from '../components/ProfileSettingsPanel';

import { chatAuthstore } from '../store/chatAuthstore';
import { useAuthStore } from '../store/AuthStorer';

function chatpage() {
   const { activeTab, selectedUser, isProfilePanelOpen, subscribeToMessages, unsubscribeToMessages } = chatAuthstore();
   const { socket } = useAuthStore();

  useEffect(() => {
    if (!socket) return;

    subscribeToMessages();
    return () => unsubscribeToMessages();
  }, [socket, subscribeToMessages, unsubscribeToMessages])

  if (isProfilePanelOpen) {
    return (
      <div className="relative w-full max-w-none md:max-w-3xl h-[100dvh] md:h-[800px]">
        <BorderAnimatedContainer>
          <ProfileSettingsPanel />
        </BorderAnimatedContainer>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-none md:max-w-6xl h-[100dvh] md:h-[800px] min-h-0">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div
          className={`${selectedUser ? "hidden" : "flex"} md:flex w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex-col min-h-0`}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className={`${selectedUser ? "flex" : "hidden"} md:flex flex-1 min-w-0 flex-col bg-slate-900/50 backdrop-blur-sm min-h-0`}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}

export default chatpage
