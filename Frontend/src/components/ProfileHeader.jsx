import React from 'react'
import { LogOutIcon, Settings2, Volume2Icon, VolumeOffIcon } from 'lucide-react'
import { useAuthStore } from '../store/AuthStorer'
import { chatAuthstore } from '../store/chatAuthstore'

const mouseClickSound = new Audio("/sounds/mouse-click.mp3")
function ProfileHeader() {

    const {logout,authuser} = useAuthStore()
  const {toggleSound , isSoundEnabled, openProfilePanel} = chatAuthstore()
    

  return (
     <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-3 text-left group"
          onClick={openProfilePanel}
        >
          {/* AVATAR */}
          <div className="avatar online">
            <div className="size-14 rounded-full overflow-hidden relative group">
              <img
                src={authuser?.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Open</span>
              </div>
            </div>
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
              {authuser?.Fullname || authuser?.fullName}
            </h3>

            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </button>

        {/* BUTTONS */}
        <div className="flex gap-4 items-center">
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              openProfilePanel();
            }}
          >
            <Settings2 className="size-5" />
          </button>

          {/* LOGOUT BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={logout}
          >
            <LogOutIcon className="size-5" />
          </button>

          {/* SOUND TOGGLE BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              // play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
