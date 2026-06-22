import { ChevronRight, LogOut, UserRound } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { DEFAULT_AVATAR } from '../services/authApi'

function UserDropdown({ user, onProfile, onLogout, onClose }) {
  const dropdownRef = useRef(null)

  useEffect(() => {
    const closeOutside = (event) => {
      if (event.target.closest('[data-sidebar-profile-trigger]')) return
      if (!dropdownRef.current?.contains(event.target)) onClose?.()
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  return (
    <div ref={dropdownRef} className="absolute bottom-20 left-2 z-30 w-52 rounded-xl border border-border-soft bg-white p-2 shadow-[0_12px_32px_rgba(17,24,39,0.14)] animate-fade-in">
      <div className="mb-1 flex items-center gap-2.5 border-b border-border-soft px-2 pb-2 pt-1">
        <img
          src={user?.avatar || DEFAULT_AVATAR}
          alt={`${user?.name || 'User'} profile`}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-text-primary">{user?.name || 'User'}</p>
          <p className="mt-0.5 truncate text-[10px] text-text-secondary">{user?.email || 'No email'}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onProfile}
        className="flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-xs font-medium text-text-primary transition hover:bg-[#EAFBF3] hover:text-primary"
      >
        <span className="flex items-center gap-2">
          <UserRound size={15} />
          My Profile
        </span>
        <ChevronRight size={14} />
      </button>
      <div className="mt-1 border-t border-border-soft pt-1">
        <button
          type="button"
          onClick={onLogout}
          className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
        >
          <LogOut size={15} />
          Log Out
        </button>
      </div>
    </div>
  )
}

export default UserDropdown
