import { ChevronRight, LogOut, UserRound } from 'lucide-react'

function UserDropdown({ onProfile }) {
  return (
    <div className="absolute bottom-20 left-3 z-30 w-56 rounded-lg border border-border-soft bg-white p-3 shadow-xl">
      <div className="mb-3 flex items-center gap-3 border-b border-border-soft pb-3">
        <img
          src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=80&q=80"
          alt="Admin profile"
          className="h-11 w-11 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-text-primary">admin</p>
          <p className="truncate text-[11px] text-text-secondary">admin@gmail.com</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onProfile}
        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-xs font-medium text-text-primary hover:bg-sidebar"
      >
        <span className="flex items-center gap-2">
          <UserRound size={15} />
          My Profile
        </span>
        <ChevronRight size={14} />
      </button>
      <button
        type="button"
        className="mt-2 flex w-full items-center gap-2 rounded-md bg-red-500 px-2 py-2 text-xs font-semibold text-white hover:bg-red-600"
      >
        <LogOut size={15} />
        Log Out
      </button>
    </div>
  )
}

export default UserDropdown
