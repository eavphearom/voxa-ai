import { Mail, Phone, UserRound, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { DEFAULT_AVATAR } from '../services/authApi'

function ProfileModal({ open, onClose, user }) {
  if (!open) return null

  const fields = [
    { label: 'Name', value: user?.name || 'User', icon: UserRound },
    { label: 'Email account', value: user?.email || 'No email', icon: Mail },
    { label: 'Mobile number', value: user?.phone || 'No phone', icon: Phone },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex min-h-dvh items-center justify-center bg-black/45 p-4 animate-fade-in">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" onClick={onClose} aria-label="Close profile modal overlay" />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-[#EAFBF3] to-white px-6 pb-6 pt-5">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-text-secondary transition hover:bg-white hover:text-text-primary" aria-label="Close profile modal">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative rounded-2xl bg-white p-1 shadow-sm">
              <img src={user?.avatar || DEFAULT_AVATAR} alt={user?.name || 'User'} className="h-20 w-20 rounded-2xl object-cover" />
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white bg-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">{user?.name || 'User'}</h2>
              <p className="mt-1 text-sm text-text-secondary">{user?.email || 'No email'}</p>
              <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                Active account
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-6 py-6">
          {fields.map(({ label, value, icon: Icon }) => (
            <label key={label} className="flex items-center gap-3 rounded-2xl border border-border-soft bg-white px-4 py-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAFBF3] text-primary">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-text-secondary">{label}</span>
                <input className="mt-1 w-full bg-transparent text-sm font-semibold text-text-primary outline-none" defaultValue={value} />
              </span>
            </label>
          ))}

          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white">
              Cancel
            </button>
            <button type="button" onClick={() => console.log('Save profile changes')} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#25A86A]">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ProfileModal
