import React, { useRef, useState } from 'react'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Save, Volume2Icon, VolumeOffIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/AuthStorer'
import { chatAuthstore } from '../store/chatAuthstore'
import { fileToCompressedDataUrl } from '../lib/imageUpload'

function ProfileSettingsPanel() {
  const { authuser, updateProfile, changePassword } = useAuthStore()
  const { closeProfilePanel, toggleSound, isSoundEnabled } = chatAuthstore()
  const fileInputRef = useRef(null)
  const [profileImage, setProfileImage] = useState(null)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const handleProfileClick = () => fileInputRef.current?.click()

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    ;(async () => {
      try {
        const base64image = await fileToCompressedDataUrl(file, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.75,
        })

        setProfileImage(base64image)
        await updateProfile({ profilePic: base64image })
      } catch (error) {
        toast.error(error.message || 'Failed to update profile image')
      }
    })()
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setIsSavingPassword(true)

    try {
      await changePassword(passwordForm)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-1 min-w-0 flex-col bg-slate-900/95 md:bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-none md:rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-700/60 p-4 md:p-6">
        <button
          type="button"
          onClick={closeProfilePanel}
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6">
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5 flex items-center gap-4">
          <button
            type="button"
            onClick={handleProfileClick}
            className="relative size-20 rounded-full overflow-hidden ring-2 ring-cyan-500/40"
          >
            <img
              src={profileImage || authuser?.profilePic || '/avatar.png'}
              alt="Profile"
              className="size-full object-cover"
            />
            <span className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 grid place-items-center text-white text-xs transition-opacity">
              Change
            </span>
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="min-w-0">
            <h3 className="text-white font-medium truncate">{authuser?.Fullname || authuser?.fullName}</h3>
            <p className="text-slate-400 text-sm truncate">{authuser?.Email}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Sound</h3>
              <p className="text-slate-400 text-sm">Toggle message notification sounds</p>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/60 transition-colors"
            >
              {isSoundEnabled ? <Volume2Icon className="size-4" /> : <VolumeOffIcon className="size-4" />}
              {isSoundEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5 space-y-4">
          <div>
            <h3 className="text-white font-medium">Change Password</h3>
            <p className="text-slate-400 text-sm">Update your login password from here.</p>
          </div>

          <form className="space-y-3" onSubmit={handlePasswordSubmit}>
            <div className="relative">
              <input
                type={showPasswords.currentPassword ? 'text' : 'password'}
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 pr-12 text-slate-100 outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => ({ ...prev, currentPassword: !prev.currentPassword }))}
                className="absolute inset-y-0 right-0 px-4 text-slate-400 hover:text-slate-200"
                aria-label={showPasswords.currentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showPasswords.currentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPasswords.newPassword ? 'text' : 'password'}
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 pr-12 text-slate-100 outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
                className="absolute inset-y-0 right-0 px-4 text-slate-400 hover:text-slate-200"
                aria-label={showPasswords.newPassword ? 'Hide new password' : 'Show new password'}
              >
                {showPasswords.newPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 pr-12 text-slate-100 outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                className="absolute inset-y-0 right-0 px-4 text-slate-400 hover:text-slate-200"
                aria-label={showPasswords.confirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showPasswords.confirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 font-medium text-white hover:bg-cyan-500 disabled:opacity-60"
            >
              <LockKeyhole className="size-4" />
              <Save className="size-4" />
              {isSavingPassword ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default ProfileSettingsPanel