import { ChevronRight, FolderInput, FolderMinus, MoreHorizontal, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

const badgeColor = {
  EN: 'bg-emerald-50 text-emerald-700',
  KH: 'bg-sky-50 text-sky-700',
  CN: 'bg-amber-50 text-amber-700',
}

function MeetingCard({ meeting, folders = [], folderMeetings = {}, onLoadFolderMeetings, onAddToFolder, onRemoveFromFolder, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [addingFolderId, setAddingFolderId] = useState(null)
  const [folderPopupPosition, setFolderPopupPosition] = useState(null)
  const [error, setError] = useState('')
  const menuRef = useRef(null)
  const moveButtonRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined

    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target) && !event.target.closest('[data-meeting-card-menu]')) {
        setMenuOpen(false)
        setFolderPopupPosition(null)
      }
    }

    document.addEventListener('pointerdown', closeMenu)
    return () => document.removeEventListener('pointerdown', closeMenu)
  }, [menuOpen])

  const toggleMenu = async () => {
    const nextOpen = !menuOpen
    setMenuOpen(nextOpen)
    setFolderPopupPosition(null)
    if (!nextOpen) return

    setError('')
    setAddingFolderId('loading')
    try {
      await Promise.all(folders.map((folder) => onLoadFolderMeetings?.(folder.id)))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setAddingFolderId(null)
    }
  }

  const openFolderPopup = () => {
    const rect = moveButtonRef.current?.getBoundingClientRect()
    if (!rect) return
    const popupWidth = 240
    setFolderPopupPosition({
      left: window.innerWidth - rect.right >= popupWidth + 16
        ? rect.right + 8
        : Math.max(8, rect.left - popupWidth - 8),
      top: Math.max(8, Math.min(rect.top, window.innerHeight - 330)),
    })
  }

  const updateFolder = async (folderId) => {
    setAddingFolderId(folderId)
    setError('')
    const currentFolderIds = folders
      .filter((folder) => (folderMeetings[folder.id] || []).some((item) => item.id === meeting.id))
      .map((folder) => folder.id)

    try {
      if (currentFolderIds.includes(folderId)) {
        await onRemoveFromFolder?.(folderId, meeting.id)
      } else {
        await onAddToFolder?.(folderId, meeting.id)
        await Promise.all(
          currentFolderIds.map((currentFolderId) => onRemoveFromFolder?.(currentFolderId, meeting.id)),
        )
      }
      setMenuOpen(false)
      setFolderPopupPosition(null)
    } catch (requestError) {
      console.error('Add meeting to folder failed:', requestError)
      setError(requestError.message)
    } finally {
      setAddingFolderId(null)
    }
  }

  return (
    <div className={`group relative rounded-2xl border border-border-soft bg-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-primary hover:shadow-md ${menuOpen ? 'z-50' : 'z-0'}`}>
      <Link to={`/meeting/${meeting.id}`} className="flex min-h-[88px] items-center px-5 py-4 pr-24">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-medium text-text-primary">{meeting.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span>{meeting.time}</span>
            <span>{meeting.duration}</span>
            <span>{meeting.speakers} speakers</span>
            <span className="flex gap-1.5">
              {(meeting.languages || []).map((language) => (
                <span key={language} className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeColor[language] || 'bg-slate-100 text-slate-600'}`}>
                  {language}
                </span>
              ))}
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1" ref={menuRef}>
        <button
          type="button"
          onClick={toggleMenu}
          className="rounded-lg p-2 text-text-secondary transition hover:bg-sidebar hover:text-primary"
          aria-label={`Open folder actions for ${meeting.title}`}
        >
          <MoreHorizontal size={20} />
        </button>
        <button
          type="button"
          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
          aria-label={`Delete ${meeting.title}`}
          onClick={() => onDelete?.(meeting.id)}
        >
          <Trash2 size={20} />
        </button>

        {menuOpen && (
          <div data-meeting-card-menu className="absolute right-0 top-12 z-[60] w-52 rounded-2xl border border-border-soft bg-white p-2 shadow-xl animate-fade-in">
            <button
              ref={moveButtonRef}
              type="button"
              onMouseEnter={openFolderPopup}
              onFocus={openFolderPopup}
              onClick={openFolderPopup}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-text-primary transition hover:bg-[#EAFBF3] hover:text-primary"
            >
              <span className="flex items-center gap-3"><FolderInput size={17} />Move to</span>
              <ChevronRight size={16} />
            </button>
            {error && <p className="px-3 py-2 text-xs font-medium text-red-500">{error}</p>}
          </div>
        )}
      </div>

      {menuOpen && folderPopupPosition && createPortal(
        <div
          data-meeting-card-menu
          className="fixed z-[2000] max-h-[320px] w-60 overflow-y-auto rounded-2xl border border-border-soft bg-white p-2 text-text-primary shadow-xl animate-fade-in"
          style={{ left: folderPopupPosition.left, top: folderPopupPosition.top }}
        >
          <p className="px-3 py-2 text-xs font-semibold uppercase text-text-secondary">Choose folder</p>
          {addingFolderId === 'loading' && <p className="px-3 py-2 text-sm text-text-secondary">Loading folders...</p>}
          {addingFolderId !== 'loading' && folders.length === 0 && <p className="px-3 py-2 text-sm text-text-secondary">No folders available</p>}
          {addingFolderId !== 'loading' && folders.map((folder) => {
            const isInFolder = (folderMeetings[folder.id] || []).some((item) => item.id === meeting.id)
            return (
              <button
                key={folder.id}
                type="button"
                disabled={addingFolderId === folder.id}
                onClick={() => updateFolder(folder.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition disabled:opacity-60 ${isInFolder ? 'text-red-500 hover:bg-red-50' : 'text-text-primary hover:bg-[#EAFBF3] hover:text-primary'}`}
              >
                {isInFolder ? <FolderMinus size={17} /> : <FolderInput size={17} />}
                <span className="truncate">{isInFolder ? `Remove from ${folder.name}` : folder.name}</span>
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </div>
  )
}

export default MeetingCard
