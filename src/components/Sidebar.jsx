import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Folder,
  FolderPlus,
  Grid2X2,
  HelpCircle,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import ConfirmDialog from './ConfirmDialog'
import FolderModal from './FolderModal'
import Logo from './Logo'
import UserDropdown from './UserDropdown'
import { communicationItems, recentItems } from '../data/mockData'

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-all duration-200 ease-in-out ${
    isActive ? 'bg-primary text-white shadow-sm' : 'text-text-primary hover:bg-white hover:shadow-sm'
  }`

function Sidebar({
  dropdownOpen,
  mobileOpen,
  collapsed,
  onToggleDropdown,
  onOpenProfile,
  onCloseMobile,
  onToggleCollapse,
  onLogout,
  authUser,
  generalChats = [],
  chatsLoading = false,
  onCreateGeneralChat,
  onRenameGeneralChat,
  onDeleteGeneralChat,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openSections, setOpenSections] = useState({
    voxa: true,
    interviews: true,
    'project-discussions': true,
    recent: true,
  })
  const [folderItems, setFolderItems] = useState(communicationItems)
  const [folderModal, setFolderModal] = useState({ open: false, mode: 'create', folder: null })
  const [historyRename, setHistoryRename] = useState({ open: false, type: null, item: null })
  const [historyDelete, setHistoryDelete] = useState({ open: false, type: null, item: null })
  const [meetingHistoryItems, setMeetingHistoryItems] = useState(recentItems)
  const [folderMenuId, setFolderMenuId] = useState(null)
  const [historyMenuId, setHistoryMenuId] = useState(null)
  const [deleteFolder, setDeleteFolder] = useState(null)

  const toggleSection = (id) => {
    setOpenSections((sections) => ({ ...sections, [id]: !sections[id] }))
  }

  const slugify = (value) => value.toLowerCase().trim().replace(/\s+/g, '-')

  const submitFolder = (name) => {
    if (folderModal.mode === 'rename') {
      setFolderItems((folders) =>
        folders.map((folder) =>
          folder.id === folderModal.folder.id
            ? { ...folder, label: name, path: `/communication/${slugify(name)}` }
            : folder,
        ),
      )
    } else {
      setFolderItems((folders) => [
        {
          id: `custom-${Date.now()}`,
          label: name,
          type: 'single',
          path: `/communication/${slugify(name)}`,
          children: [],
        },
        ...folders,
      ])
    }
    setFolderModal({ open: false, mode: 'create', folder: null })
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

  const confirmDeleteFolder = () => {
    setFolderItems((folders) => folders.filter((folder) => folder.id !== deleteFolder.id))
    setDeleteFolder(null)
    setFolderMenuId(null)
  }

  const submitHistoryRename = (name) => {
    if (historyRename.type === 'chat') {
      onRenameGeneralChat?.(historyRename.item.id, name)
    }

    if (historyRename.type === 'meeting') {
      setMeetingHistoryItems((items) =>
        items.map((item) => (item.id === historyRename.item.id ? { ...item, label: name } : item)),
      )
    }

    setHistoryRename({ open: false, type: null, item: null })
    setHistoryMenuId(null)
  }

  const confirmHistoryDelete = () => {
    if (historyDelete.type === 'chat') {
      onDeleteGeneralChat?.(historyDelete.item.id)
    }

    if (historyDelete.type === 'meeting') {
      setMeetingHistoryItems((items) => items.filter((item) => item.id !== historyDelete.item.id))
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-border-soft bg-sidebar p-4 transition-transform duration-300 lg:z-40 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[84px]' : 'lg:w-[250px]'}`}
      >
      <div className="mb-6 flex items-center justify-between">
        <div className={collapsed ? 'lg:hidden' : ''}><Logo /></div>
        <div className={`hidden ${collapsed ? 'lg:flex' : ''} h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white`}>V</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onToggleCollapse} className="hidden rounded-md p-1 hover:bg-white lg:block" aria-label="Toggle sidebar">
            {collapsed ? <PanelLeftOpen size={17} className="text-text-secondary" /> : <PanelLeftClose size={17} className="text-text-secondary" />}
          </button>
          <button type="button" onClick={onCloseMobile} className="rounded-md p-1 hover:bg-white lg:hidden" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto pr-1">
        <nav className="relative z-40 space-y-2">
          <NavLink to="/" className={navLinkClass}>
            <Grid2X2 size={18} />
            <span className={labelClass}>Home</span>
          </NavLink>
          <button
            type="button"
            onClick={() => toggleSection('voxa')}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-all duration-200 ${
              location.pathname.startsWith('/voxa-ai') ? 'bg-primary text-white shadow-sm' : 'text-text-primary hover:bg-white hover:shadow-sm'
            }`}
          >
            <span className="flex items-center gap-3">
              <MessageSquareText size={18} />
              <span className={labelClass}>VOXA AI</span>
            </span>
            {!collapsed && (openSections.voxa ? <ChevronUp size={15} /> : <ChevronDown size={15} />)}
          </button>
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
          <button
            type="button"
            onClick={() => setFolderModal({ open: true, mode: 'create', folder: null })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-semibold text-primary transition-all duration-200 hover:bg-white hover:shadow-sm"
          >
            <FolderPlus size={17} />
            <span className={`truncate ${labelClass}`}>Create New Folder</span>
          </button>
          {folderItems.map((item) => {
            const Icon = item.type === 'single' ? FolderPlus : Folder
            const isOpen = openSections[item.id]
            return (
              <div key={item.id} className="relative">
                <NavLink
                  to={item.path}
                  onClick={() => item.children.length && toggleSection(item.id)}
                  className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-[15px] font-semibold transition-all duration-200 hover:bg-white"
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
                      {!!item.children.length && (isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />)}
                    </span>
                  )}
                </NavLink>
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
                {!!item.children.length && isOpen && !collapsed && (
                  <div className="ml-8 mt-1 space-y-1">
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
            {meetingHistoryItems.map((item) => (
              <HistoryNavItem
                key={item.id}
                id={`meeting-${item.id}`}
                label={item.label}
                to={item.path}
                menuOpen={historyMenuId === `meeting-${item.id}`}
                onToggleMenu={() => setHistoryMenuId((value) => (value === `meeting-${item.id}` ? null : `meeting-${item.id}`))}
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
              />
            ))}
          </div>
        )}
      </div>
      </div>

      <div className="mt-4 shrink-0 space-y-2 border-t border-border-soft pt-3">
        <button type="button" className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-[15px] font-semibold text-text-primary transition hover:shadow-sm">
          <HelpCircle size={15} />
          <span className={labelClass}>Help</span>
        </button>
        <NavLink to="/settings" className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-[15px] font-semibold text-text-primary transition hover:shadow-sm">
          <Settings size={15} />
          <span className={labelClass}>Settings</span>
        </NavLink>
        <button
          data-sidebar-action-menu
          type="button"
          onClick={onToggleDropdown}
          className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left transition hover:shadow-sm"
        >
          <img src={authUser.avatar} alt={authUser.name} className="h-8 w-8 rounded-full object-cover" />
          <span className={`min-w-0 ${labelClass}`}>
            <span className="block text-sm font-semibold text-text-primary">{authUser.name}</span>
            <span className="block truncate text-xs text-text-secondary">{authUser.email}</span>
          </span>
        </button>
      </div>

      {dropdownOpen && <UserDropdown user={authUser} onProfile={onOpenProfile} onLogout={onLogout} />}
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
      message={`Are you sure you want to delete "${deleteFolder?.label}"? This only removes it from the sidebar demo state.`}
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
}) {
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
        <div data-sidebar-action-menu className="absolute right-0 top-full z-[1000] mt-2 w-[205px] rounded-2xl border border-border-soft bg-white p-2 text-text-primary shadow-xl animate-fade-in">
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
    </div>
  )
}

export default Sidebar
