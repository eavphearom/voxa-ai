import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit3,
  Folder,
  FolderInput,
  FolderMinus,
  FolderPlus,
  Grid2X2,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import ConfirmDialog from './ConfirmDialog'
import FolderModal from './FolderModal'
import Logo from './Logo'
import UserDropdown from './UserDropdown'

const navLinkClass = ({ isActive }) =>
  `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-all duration-200 ease-in-out ${
    isActive ? 'bg-primary text-white shadow-sm' : 'text-text-primary hover:bg-[#EAFBF3] hover:text-primary'
  }`

function Sidebar({
  dropdownOpen,
  mobileOpen,
  collapsed,
  onToggleDropdown,
  onCloseDropdown,
  onOpenProfile,
  onCloseMobile,
  onToggleCollapse,
  onLogout,
  authUser,
  generalChats = [],
  chatsLoading = false,
  meetings = [],
  meetingsLoading = false,
  folders = [],
  foldersLoading = false,
  foldersError = '',
  folderMeetings = {},
  folderMeetingsLoading = {},
  onCreateGeneralChat,
  onRenameGeneralChat,
  onDeleteGeneralChat,
  onRenameMeeting,
  onDeleteMeeting,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onLoadFolderMeetings,
  onAddMeetingToFolder,
  onRemoveMeetingFromFolder,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openSections, setOpenSections] = useState({
    voxa: true,
    interviews: true,
    'project-discussions': true,
    recent: true,
  })
  const [folderModal, setFolderModal] = useState({ open: false, mode: 'create', folder: null })
  const [historyRename, setHistoryRename] = useState({ open: false, type: null, item: null })
  const [historyDelete, setHistoryDelete] = useState({ open: false, type: null, item: null })
  const [folderMenuId, setFolderMenuId] = useState(null)
  const [historyMenuId, setHistoryMenuId] = useState(null)
  const [historyFolderLoadingId, setHistoryFolderLoadingId] = useState(null)
  const [historyFolderError, setHistoryFolderError] = useState('')
  const [deleteFolder, setDeleteFolder] = useState(null)
  const [folderActionError, setFolderActionError] = useState('')
  const folderItems = folders.map((folder) => ({
    ...folder,
    label: folder.name,
    path: `/communication/${folder.id}`,
    children: (folderMeetings[folder.id] || []).map((meeting) => ({
      id: meeting.id,
      label: meeting.title,
      path: `/meeting/${meeting.id}`,
    })),
  }))
  const meetingHistoryItems = meetings.map((meeting) => ({
    id: meeting.id,
    label: meeting.title,
    path: `/meeting/${meeting.id}`,
  }))

  const toggleSection = (id) => {
    setOpenSections((sections) => ({ ...sections, [id]: !sections[id] }))
  }

  const submitFolder = async (name) => {
    setFolderActionError('')
    try {
      if (folderModal.mode === 'rename') {
        await onRenameFolder?.(folderModal.folder.id, name)
      } else {
        await onCreateFolder?.(name)
      }
      setFolderModal({ open: false, mode: 'create', folder: null })
    } catch (error) {
      console.error('Save folder API failed:', error)
      setFolderActionError(error.message)
    }
  }

  const shareFolder = async (folder) => {
    const link = `${window.location.origin}${folder.path}`
    try {
      await navigator.clipboard.writeText(link)
      window.alert('Folder link copied to clipboard.')
    } catch {
      window.alert(`Share this link: ${link}`)
    }
    setFolderMenuId(null)
  }

  const confirmDeleteFolder = async () => {
    try {
      await onDeleteFolder?.(deleteFolder.id)
      setDeleteFolder(null)
      setFolderMenuId(null)
    } catch (error) {
      console.error('Delete folder API failed:', error)
      setFolderActionError(error.message)
    }
  }

  const submitHistoryRename = (name) => {
    if (historyRename.type === 'chat') {
      onRenameGeneralChat?.(historyRename.item.id, name)
    }

    if (historyRename.type === 'meeting') {
      onRenameMeeting?.(historyRename.item.id, name)
    }

    setHistoryRename({ open: false, type: null, item: null })
    setHistoryMenuId(null)
  }

  const confirmHistoryDelete = async () => {
    if (historyDelete.type === 'chat') {
      onDeleteGeneralChat?.(historyDelete.item.id)
    }

    if (historyDelete.type === 'meeting') {
      try {
        await onDeleteMeeting?.(historyDelete.item.id)
      } catch (error) {
        console.error('Delete meeting API failed:', error)
        return
      }
    }

    setHistoryDelete({ open: false, type: null, item: null })
    setHistoryMenuId(null)
  }

  const shareItem = async (path, label) => {
    const link = `${window.location.origin}${path}`
    try {
      await navigator.clipboard.writeText(link)
      window.alert(`${label} link copied to clipboard.`)
    } catch {
      window.alert(`Share this link: ${link}`)
    }
    setHistoryMenuId(null)
  }

  const toggleMeetingMenu = async (item) => {
    const menuId = `meeting-${item.id}`
    if (historyMenuId === menuId) {
      setHistoryMenuId(null)
      return
    }

    setHistoryMenuId(menuId)
    setHistoryFolderError('')
    setHistoryFolderLoadingId(item.id)
    try {
      await Promise.all(folders.map((folder) => onLoadFolderMeetings?.(folder.id)))
    } catch (error) {
      console.error('Load meeting folder membership failed:', error)
      setHistoryFolderError(error.message)
    } finally {
      setHistoryFolderLoadingId(null)
    }
  }

  const moveMeetingToFolder = async (meetingId, targetFolderId) => {
    setHistoryFolderLoadingId(meetingId)
    setHistoryFolderError('')
    const currentFolderIds = folders
      .filter((folder) => (folderMeetings[folder.id] || []).some((meeting) => meeting.id === meetingId))
      .map((folder) => folder.id)

    try {
      if (!currentFolderIds.includes(targetFolderId)) {
        await onAddMeetingToFolder?.(targetFolderId, meetingId)
      }
      await Promise.all(
        currentFolderIds
          .filter((folderId) => folderId !== targetFolderId)
          .map((folderId) => onRemoveMeetingFromFolder?.(folderId, meetingId)),
      )
      setHistoryMenuId(null)
    } catch (error) {
      console.error('Move meeting to folder failed:', error)
      setHistoryFolderError(error.message)
    } finally {
      setHistoryFolderLoadingId(null)
    }
  }

  const removeMeetingFromFolder = async (meetingId, folderId) => {
    setHistoryFolderLoadingId(meetingId)
    setHistoryFolderError('')
    try {
      await onRemoveMeetingFromFolder?.(folderId, meetingId)
      setHistoryMenuId(null)
    } catch (error) {
      console.error('Remove meeting from folder failed:', error)
      setHistoryFolderError(error.message)
    } finally {
      setHistoryFolderLoadingId(null)
    }
  }

  const labelClass = collapsed ? 'lg:hidden' : ''
  const activeGeneralChatId = location.pathname.startsWith('/voxa-ai/')
    ? decodeURIComponent(location.pathname.split('/').pop())
    : null

  const createGeneralChat = async () => {
    const id = await onCreateGeneralChat?.(activeGeneralChatId)
    if (id) navigate(`/voxa-ai/${id}`)
  }

  useEffect(() => {
    if (!folderMenuId && !historyMenuId) {
      return undefined
    }

    const closeOpenMenus = (event) => {
      if (event.target.closest('[data-sidebar-action-menu]')) {
        return
      }

      setFolderMenuId(null)
      setHistoryMenuId(null)
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setFolderMenuId(null)
        setHistoryMenuId(null)
      }
    }

    document.addEventListener('pointerdown', closeOpenMenus)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOpenMenus)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [folderMenuId, historyMenuId])

  return (
    <>
      {mobileOpen && <button type="button" className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onCloseMobile} aria-label="Close menu overlay" />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-border-soft bg-sidebar p-4 transition-[width,transform] duration-300 ease-in-out lg:z-40 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[84px]' : 'lg:w-[250px]'}`}
      >
      <div className="mb-6 flex min-h-10 items-center justify-center">
        <div className={collapsed ? 'lg:hidden' : ''}><Logo /></div>
        <SidebarTooltip enabled={collapsed} label="Expand sidebar">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`group relative hidden h-10 w-12 items-center justify-center rounded-lg transition hover:bg-[#EAFBF3] focus:outline-none focus:ring-4 focus:ring-primary/15 ${collapsed ? 'lg:flex' : ''}`}
            aria-label="Expand sidebar"
          >
            <Logo compact className="transition duration-200 group-hover:opacity-20" />
            <PanelLeftOpen size={19} className="absolute text-primary opacity-0 transition duration-200 group-hover:opacity-100 group-focus:opacity-100" />
          </button>
        </SidebarTooltip>
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`absolute -right-[18px] top-5 z-20 hidden h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-white text-text-secondary shadow-[0_4px_14px_rgba(17,24,39,0.12)] transition-all duration-200 hover:border-primary hover:bg-[#EAFBF3] hover:text-primary hover:shadow-md focus:outline-none focus:ring-4 focus:ring-primary/15 ${collapsed ? 'lg:hidden' : 'lg:flex'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-white text-text-secondary shadow-sm transition hover:border-primary hover:bg-[#EAFBF3] hover:text-primary lg:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto pr-1">
        <nav className="relative z-40 space-y-2">
          <SidebarTooltip enabled={collapsed} label="Home">
            <NavLink
              to="/"
              className={(state) => `${navLinkClass(state)} ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
            >
              <Grid2X2 size={18} />
              <span className={labelClass}>Home</span>
            </NavLink>
          </SidebarTooltip>
          <SidebarTooltip enabled={collapsed} label="VOXA AI">
            <button
              type="button"
              onClick={() => toggleSection('voxa')}
              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-all duration-200 ${collapsed ? 'lg:justify-center lg:px-0' : 'justify-between'} ${
                location.pathname.startsWith('/voxa-ai') ? 'bg-primary text-white shadow-sm' : 'text-text-primary hover:bg-[#EAFBF3] hover:text-primary'
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquareText size={18} />
                <span className={labelClass}>VOXA AI</span>
              </span>
              {!collapsed && (openSections.voxa ? <ChevronUp size={15} /> : <ChevronDown size={15} />)}
            </button>
          </SidebarTooltip>
          {openSections.voxa && !collapsed && (
            <div className="relative z-50 space-y-1 pl-4 animate-fade-in">
              <button
                type="button"
                onClick={createGeneralChat}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-semibold text-primary transition hover:bg-white"
              >
                <FolderPlus size={15} />
                New Chat
              </button>
              {chatsLoading && (
                <p className="px-3 py-2 text-xs font-medium text-text-secondary">Loading chats...</p>
              )}
              {!chatsLoading && generalChats.length === 0 && (
                <p className="px-3 py-2 text-xs font-medium text-text-secondary">
                  No chat history yet
                </p>
              )}
              {generalChats.map((chat) => {
                const path = `/voxa-ai/${chat.id}`
                return (
                  <HistoryNavItem
                    key={chat.id}
                    id={`chat-${chat.id}`}
                    label={chat.title}
                    to={path}
                    active={activeGeneralChatId === chat.id}
                    menuOpen={historyMenuId === `chat-${chat.id}`}
                    onToggleMenu={() => setHistoryMenuId((value) => (value === `chat-${chat.id}` ? null : `chat-${chat.id}`))}
                    onShare={() => shareItem(path, chat.title)}
                    onRename={() => {
                      setHistoryRename({ open: true, type: 'chat', item: chat })
                      setHistoryMenuId(null)
                    }}
                    onDelete={() => {
                      setHistoryDelete({ open: true, type: 'chat', item: chat })
                      setHistoryMenuId(null)
                    }}
                    renameLabel="Rename chat"
                    deleteLabel="Delete chat"
                  />
                )
              })}
            </div>
          )}
        </nav>

      <div className="relative z-10 mt-6">
        <p className={`mb-3 text-[11px] font-medium uppercase text-text-secondary ${labelClass}`}>Communication</p>
        <div className="space-y-1 text-[15px] font-semibold text-text-primary">
          <SidebarTooltip enabled={collapsed} label="Create new folder">
            <button
              type="button"
              onClick={() => setFolderModal({ open: true, mode: 'create', folder: null })}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-semibold text-primary transition-all duration-200 hover:bg-[#EAFBF3] ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
            >
              <FolderPlus size={17} />
              <span className={`truncate ${labelClass}`}>Create New Folder</span>
            </button>
          </SidebarTooltip>
          {foldersLoading && !collapsed && (
            <p className="px-3 py-2 text-xs font-medium text-text-secondary">Loading folders...</p>
          )}
          {(foldersError || folderActionError) && !collapsed && (
            <p className="px-3 py-2 text-xs font-medium text-red-500">{folderActionError || foldersError}</p>
          )}
          {!collapsed && !foldersLoading && !foldersError && folderItems.length === 0 && (
            <p className="px-3 py-2 text-xs font-medium text-text-secondary">No folders yet</p>
          )}
          {folderItems.map((item) => {
            const Icon = Folder
            const isOpen = openSections[item.id]
            return (
              <div key={item.id} className="relative">
                <SidebarTooltip enabled={collapsed} label={item.label}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      toggleSection(item.id)
                      if (!isOpen) {
                        Promise.resolve(onLoadFolderMeetings?.(item.id)).catch((error) => {
                          console.error('Load folder meetings failed:', error)
                          setFolderActionError(error.message)
                        })
                      }
                    }}
                    className={`group flex w-full items-center rounded-xl px-3 py-2 text-[15px] font-semibold transition-all duration-200 hover:bg-[#EAFBF3] hover:text-primary ${collapsed ? 'lg:justify-center lg:px-0' : 'justify-between'}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon size={17} />
                      <span className={`truncate ${labelClass}`}>{item.label}</span>
                    </span>
                    {!collapsed && (
                      <span className="ml-2 flex shrink-0 items-center gap-1">
                      <button
                        data-sidebar-action-menu
                        type="button"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setFolderModal({ open: true, mode: 'rename', folder: item })
                        }}
                        className="rounded-lg p-1.5 text-text-secondary opacity-0 transition hover:bg-[#EAFBF3] hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 group-hover:opacity-100"
                        aria-label={`Rename ${item.label}`}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        data-sidebar-action-menu
                        type="button"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setFolderMenuId((id) => (id === item.id ? null : item.id))
                        }}
                        className="rounded-lg p-1.5 text-text-secondary opacity-0 transition hover:bg-[#EAFBF3] hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 group-hover:opacity-100"
                        aria-label={`Open actions for ${item.label}`}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </span>
                    )}
                  </NavLink>
                </SidebarTooltip>
                {folderMenuId === item.id && !collapsed && (
                  <div data-sidebar-action-menu className="absolute left-10 right-0 top-11 z-50 rounded-2xl border border-border-soft bg-white p-2 text-text-primary shadow-lg animate-fade-in">
                    <button
                      type="button"
                      onClick={() => shareFolder(item)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold transition hover:bg-[#EAFBF3] hover:text-primary"
                    >
                      <Share2 size={18} />
                      Share project
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFolderMenuId(null)
                        setFolderModal({ open: true, mode: 'rename', folder: item })
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold transition hover:bg-[#EAFBF3] hover:text-primary"
                    >
                      <Pencil size={18} />
                      Rename project
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteFolder(item)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                      Delete project
                    </button>
                  </div>
                )}
                {isOpen && !collapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {folderMeetingsLoading[item.id] && (
                      <p className="px-3 py-1.5 text-xs text-text-secondary">Loading meetings...</p>
                    )}
                    {!folderMeetingsLoading[item.id] && item.children.length === 0 && (
                      <p className="px-3 py-1.5 text-xs text-text-secondary">No meetings</p>
                    )}
                    {item.children.map((child) => (
                      <NavLink key={child.id} to={child.path} className="block rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white">
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="relative z-0 mt-5">
        <button type="button" onClick={() => toggleSection('recent')} className={`mb-2 flex w-full items-center justify-between px-3 text-[11px] text-text-secondary ${collapsed ? 'lg:hidden' : ''}`}>
          <span>Recent Meetings</span>
          {openSections.recent ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {openSections.recent && !collapsed && (
          <div className="space-y-1">
            {meetingsLoading && (
              <p className="px-3 py-2 text-xs font-medium text-text-secondary">Loading meetings...</p>
            )}
            {!meetingsLoading && meetingHistoryItems.length === 0 && (
              <p className="px-3 py-2 text-xs font-medium text-text-secondary">No meeting history</p>
            )}
            {meetingHistoryItems.map((item) => (
              <HistoryNavItem
                key={item.id}
                id={`meeting-${item.id}`}
                label={item.label}
                to={item.path}
                menuOpen={historyMenuId === `meeting-${item.id}`}
                onToggleMenu={() => toggleMeetingMenu(item)}
                onShare={() => shareItem(item.path, item.label)}
                onRename={() => {
                  setHistoryRename({ open: true, type: 'meeting', item })
                  setHistoryMenuId(null)
                }}
                onDelete={() => {
                  setHistoryDelete({ open: true, type: 'meeting', item })
                  setHistoryMenuId(null)
                }}
                renameLabel="Rename history"
                deleteLabel="Delete history"
                folders={folders}
                folderMeetings={folderMeetings}
                folderLoading={historyFolderLoadingId === item.id}
                folderError={historyFolderError}
                meetingId={item.id}
                onMoveToFolder={moveMeetingToFolder}
                onRemoveFromFolder={removeMeetingFromFolder}
              />
            ))}
          </div>
        )}
      </div>
      </div>

      <div className="mt-4 shrink-0 space-y-2 border-t border-border-soft pt-3">
        {/* <button type="button" className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-[15px] font-semibold text-text-primary transition hover:shadow-sm">
          <HelpCircle size={15} />
          <span className={labelClass}>Help</span>
        </button> */}
        {/* <NavLink to="/settings" className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-[15px] font-semibold text-text-primary transition hover:shadow-sm">
          <Settings size={15} />
          <span className={labelClass}>Settings</span>
        </NavLink> */}
        <SidebarTooltip enabled={collapsed} label={'Profile'}/* label={authUser.name} */ >
          <button
            data-sidebar-profile-trigger
            type="button"
            onClick={onToggleDropdown}
            className={`flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left transition hover:bg-[#EAFBF3] hover:shadow-sm ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <img src={authUser.avatar} alt={authUser.name} className="h-8 w-8 rounded-full object-cover" />
            <span className={`min-w-0 ${labelClass}`}>
              <span className="block text-sm font-semibold text-text-primary">{authUser.name}</span>
              <span className="block truncate text-xs text-text-secondary">{authUser.email}</span>
            </span>
          </button>
        </SidebarTooltip>
      </div>

      {dropdownOpen && <UserDropdown user={authUser} onProfile={onOpenProfile} onLogout={onLogout} onClose={onCloseDropdown} />}
    </aside>
    <FolderModal
      key={`${folderModal.mode}-${folderModal.folder?.id || 'new'}`}
      open={folderModal.open}
      mode={folderModal.mode}
      initialName={folderModal.folder?.label || ''}
      onClose={() => setFolderModal({ open: false, mode: 'create', folder: null })}
      onSubmit={submitFolder}
    />
    <ConfirmDialog
      open={!!deleteFolder}
      title="Delete folder?"
      message={`Are you sure you want to delete "${deleteFolder?.label}"?`}
      confirmLabel="Delete"
      onCancel={() => setDeleteFolder(null)}
      onConfirm={confirmDeleteFolder}
    />
    <FolderModal
      key={`${historyRename.type}-${historyRename.item?.id || 'history'}`}
      open={historyRename.open}
      mode="rename"
      title={historyRename.type === 'chat' ? 'Rename chat' : 'Rename history'}
      description={historyRename.type === 'chat' ? 'Update this VOXA AI chat title.' : 'Update this meeting history title.'}
      fieldLabel="Name"
      submitLabel="Save Name"
      initialName={historyRename.item?.title || historyRename.item?.label || ''}
      onClose={() => setHistoryRename({ open: false, type: null, item: null })}
      onSubmit={submitHistoryRename}
    />
    <ConfirmDialog
      open={historyDelete.open}
      title={historyDelete.type === 'chat' ? 'Delete chat?' : 'Delete history?'}
      message={`Are you sure you want to delete "${historyDelete.item?.title || historyDelete.item?.label}"? This only removes it from the current demo state.`}
      confirmLabel="Delete"
      onCancel={() => setHistoryDelete({ open: false, type: null, item: null })}
      onConfirm={confirmHistoryDelete}
    />
    </>
  )
}

function SidebarTooltip({ enabled, label, children }) {
  const [position, setPosition] = useState(null)

  const showTooltip = (element) => {
    if (!enabled) return
    const rect = element.getBoundingClientRect()
    setPosition({
      left: rect.right + 12,
      top: Math.max(8, Math.min(rect.top, window.innerHeight - 44)),
    })
  }

  return (
    <div
      className="relative flex w-full justify-center"
      onMouseEnter={(event) => showTooltip(event.currentTarget)}
      onMouseLeave={() => setPosition(null)}
      onFocusCapture={(event) => showTooltip(event.currentTarget)}
      onBlurCapture={() => setPosition(null)}
    >
      {children}
      {enabled && position && createPortal(
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[3000] whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-xl animate-fade-in"
          style={{ left: position.left, top: position.top }}
        >
          <span className="absolute -left-1 top-3 h-2 w-2 rotate-45 bg-primary" />
          {label}
        </span>,
        document.body,
      )}
    </div>
  )
}

function HistoryNavItem({
  label,
  to,
  active = false,
  menuOpen,
  onToggleMenu,
  onShare,
  onRename,
  onDelete,
  renameLabel,
  deleteLabel,
  folders,
  folderMeetings,
  folderLoading,
  folderError,
  meetingId,
  onMoveToFolder,
  onRemoveFromFolder,
}) {
  const moveButtonRef = useRef(null)
  const [folderPopupPosition, setFolderPopupPosition] = useState(null)

  const openFolderPopup = () => {
    const rect = moveButtonRef.current?.getBoundingClientRect()
    if (!rect) return

    const popupWidth = 240
    const spaceOnRight = window.innerWidth - rect.right
    setFolderPopupPosition({
      left: spaceOnRight >= popupWidth + 16
        ? rect.right + 8
        : Math.max(8, rect.left - popupWidth - 8),
      top: Math.max(8, Math.min(rect.top, window.innerHeight - 330)),
    })
  }

  return (
    <div className={`relative ${menuOpen ? 'z-[999]' : 'z-0'}`}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `group flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition ${
            active || isActive ? 'bg-[#EAFBF3] text-primary' : 'text-slate-700 hover:bg-white'
          }`
        }
      >
        <span className="min-w-0 truncate">{label}</span>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onToggleMenu()
          }}
          className="shrink-0 rounded-lg p-1 text-text-secondary opacity-0 transition hover:bg-[#EAFBF3] hover:text-primary focus:opacity-100 group-hover:opacity-100"
          aria-label={`Open actions for ${label}`}
        >
          <MoreHorizontal size={16} />
        </button>
      </NavLink>

      {menuOpen && (
        <div data-sidebar-action-menu className={`absolute top-full z-[1000] mt-2 max-h-[min(420px,70vh)] overflow-y-auto rounded-2xl border border-border-soft bg-white p-2 text-text-primary shadow-xl animate-fade-in ${meetingId ? 'left-0 right-auto w-full' : 'right-0 w-[205px]'}`}>
          <button
            type="button"
            onClick={onShare}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold transition hover:bg-[#EAFBF3] hover:text-primary"
          >
            <Share2 size={17} />
            Share
          </button>
          <button
            type="button"
            onClick={onRename}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold transition hover:bg-[#EAFBF3] hover:text-primary"
          >
            <Pencil size={17} />
            {renameLabel}
          </button>
          {meetingId && (
            <div className="my-1 border-y border-border-soft py-1">
              <button
                ref={moveButtonRef}
                type="button"
                onMouseEnter={openFolderPopup}
                onFocus={openFolderPopup}
                onClick={openFolderPopup}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold transition hover:bg-[#EAFBF3] hover:text-primary"
              >
                <span className="flex items-center gap-3"><FolderInput size={17} />Move to</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-red-500 transition hover:bg-red-50"
          >
            <Trash2 size={17} />
            {deleteLabel}
          </button>
        </div>
      )}

      {menuOpen && meetingId && folderPopupPosition && createPortal(
        <div
          data-sidebar-action-menu
          className="fixed z-[2000] max-h-[320px] w-60 overflow-y-auto rounded-2xl border border-border-soft bg-white p-2 text-text-primary shadow-xl animate-fade-in"
          style={{ left: folderPopupPosition.left, top: folderPopupPosition.top }}
        >
          <p className="px-3 py-2 text-[11px] font-semibold uppercase text-text-secondary">Choose folder</p>
          {folderLoading && <p className="px-3 py-2 text-xs text-text-secondary">Loading folders...</p>}
          {!folderLoading && folders.length === 0 && <p className="px-3 py-2 text-xs text-text-secondary">No folders available</p>}
          {!folderLoading && folders.map((folder) => {
            const isInFolder = (folderMeetings[folder.id] || []).some((meeting) => meeting.id === meetingId)
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => isInFolder ? onRemoveFromFolder(meetingId, folder.id) : onMoveToFolder(meetingId, folder.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${isInFolder ? 'text-red-500 hover:bg-red-50' : 'text-text-primary hover:bg-[#EAFBF3] hover:text-primary'}`}
              >
                {isInFolder ? <FolderMinus size={17} /> : <FolderInput size={17} />}
                <span className="truncate">{isInFolder ? `Remove from ${folder.name}` : folder.name}</span>
              </button>
            )
          })}
          {folderError && <p className="px-3 py-2 text-xs font-medium text-red-500">{folderError}</p>}
        </div>,
        document.body,
      )}
    </div>
  )
}

export default Sidebar
