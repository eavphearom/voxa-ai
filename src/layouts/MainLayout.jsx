import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import {
  addMeetingToFolder as addMeetingToFolderApi,
  clearAuth,
  createChat,
  createFolder as createFolderApi,
  deleteChat,
  deleteFolder as deleteFolderApi,
  deleteMeeting,
  getFolderMeetings,
  getFolders,
  getChats,
  getChatDetail,
  getMeetings,
  getStoredUser,
  isApiChatId,
  logoutUser,
  normalizeChat,
  normalizeChats,
  normalizeFolder,
  normalizeFolderMeetings,
  normalizeFolders,
  normalizeMeetings,
  removeMeetingFromFolder as removeMeetingFromFolderApi,
  updateChat,
  updateFolder as updateFolderApi,
} from '../services/authApi'

function MainLayout() {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [generalChats, setGeneralChats] = useState([])
  const [chatsLoading, setChatsLoading] = useState(true)
  const [meetings, setMeetings] = useState([])
  const [meetingsLoading, setMeetingsLoading] = useState(true)
  const [folders, setFolders] = useState([])
  const [foldersLoading, setFoldersLoading] = useState(true)
  const [foldersError, setFoldersError] = useState('')
  const [folderMeetings, setFolderMeetings] = useState({})
  const [folderMeetingsLoading, setFolderMeetingsLoading] = useState({})
  const [authUser, setAuthUser] = useState(() => getStoredUser())
  const creatingChatRef = useRef(false)
  const folderMeetingsRef = useRef({})
  const meetingsRequestRef = useRef(0)

  useEffect(() => {
    folderMeetingsRef.current = folderMeetings
  }, [folderMeetings])

  const openProfile = () => {
    setDropdownOpen(false)
    navigate('/profile')
  }

  useEffect(() => {
    let ignore = false

    async function loadChats() {
      setChatsLoading(true)
      try {
        const data = await getChats()
        if (!ignore) {
          setGeneralChats((fallback) => normalizeChats(data, fallback))
        }
      } catch (error) {
        console.error('Get chats API failed:', error)
      } finally {
        if (!ignore) {
          setChatsLoading(false)
        }
      }
    }

    loadChats()

    return () => {
      ignore = true
    }
  }, [])

  const refreshMeetings = useCallback(async (filters = {}) => {
    const requestId = meetingsRequestRef.current + 1
    meetingsRequestRef.current = requestId
    setMeetingsLoading(true)
    try {
      const data = await getMeetings(filters)
      const nextMeetings = normalizeMeetings(data)
      if (requestId === meetingsRequestRef.current) setMeetings(nextMeetings)
      return nextMeetings
    } finally {
      if (requestId === meetingsRequestRef.current) setMeetingsLoading(false)
    }
  }, [])

  const loadFolders = useCallback(async () => {
    setFoldersLoading(true)
    setFoldersError('')
    try {
      const data = await getFolders()
      setFolders(normalizeFolders(data))
    } catch (error) {
      console.error('Get folders API failed:', error)
      setFolders([])
      setFoldersError(error.message)
    } finally {
      setFoldersLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadInitialFolders() {
      try {
        const data = await getFolders()
        if (!ignore) {
          setFolders(normalizeFolders(data))
          setFoldersError('')
        }
      } catch (error) {
        console.error('Get folders API failed:', error)
        if (!ignore) {
          setFolders([])
          setFoldersError(error.message)
        }
      } finally {
        if (!ignore) {
          setFoldersLoading(false)
        }
      }
    }

    loadInitialFolders()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshMeetings().catch((error) => {
        console.error('Get meetings API failed:', error)
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refreshMeetings])

  const logout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      clearAuth()
      setAuthUser(getStoredUser())
      navigate('/login', { replace: true })
    }
  }

  const createGeneralChat = useCallback(async (currentChatId) => {
    const hasMessages = (chat) => (chat.messages || []).length > 0
    const currentEmptyChat = generalChats.find(
      (chat) => chat.id === currentChatId && !hasMessages(chat),
    )
    const existingEmptyChat = generalChats.find((chat) => !hasMessages(chat))

    // Keep only one empty chat: reuse the selected empty chat first, then any empty draft.
    if (currentEmptyChat || existingEmptyChat) {
      return (currentEmptyChat || existingEmptyChat).id
    }

    // Prevent fast repeated clicks from firing duplicate create requests.
    if (creatingChatRef.current) {
      return null
    }

    creatingChatRef.current = true
    const id = `general-chat-${generalChats.length + 1}`
    const fallbackChat = {
      id,
      title: `New Chat ${generalChats.length + 1}`,
      updatedAt: 'Now',
      messages: [],
    }

    try {
      const data = await createChat({ title: fallbackChat.title })
      const chat = normalizeChat(data, fallbackChat)
      setGeneralChats((items) => [chat, ...items.filter((item) => item.id !== chat.id)])
      return chat.id
    } catch (error) {
      console.error('Create chat API failed:', error)
      return null
    } finally {
      creatingChatRef.current = false
    }
  }, [generalChats])

  const updateGeneralChatMessages = useCallback((chatId, updater) => {
    setGeneralChats((items) =>
      items.map((chat) =>
        chat.id === chatId
          ? { ...chat, updatedAt: 'Now', messages: updater(chat.messages) }
          : chat,
      ),
    )
  }, [])

  const renameGeneralChat = async (chatId, title) => {
    setGeneralChats((items) =>
      items.map((chat) => (chat.id === chatId ? { ...chat, title, updatedAt: 'Now' } : chat)),
    )

    if (!isApiChatId(chatId)) {
      return
    }

    try {
      const data = await updateChat(chatId, { title })
      setGeneralChats((items) => {
        const fallback = items.find((chat) => chat.id === chatId) || { id: chatId, title }
        const chat = normalizeChat(data, fallback)
        return items.map((item) => (item.id === chatId || item.id === chat.id ? chat : item))
      })
    } catch (error) {
      console.error('Update chat API failed:', error)
    }
  }

  const deleteGeneralChat = async (chatId) => {
    if (isApiChatId(chatId)) {
      try {
        await deleteChat(chatId)
      } catch (error) {
        console.error('Delete chat API failed:', error)
      }
    }

    setGeneralChats((items) => items.filter((chat) => chat.id !== chatId))
  }

  const renameMeetingHistory = (meetingId, title) => {
    setMeetings((items) =>
      items.map((meeting) => (meeting.id === meetingId ? { ...meeting, title } : meeting)),
    )
  }

  const deleteMeetingHistory = async (meetingId) => {
    await deleteMeeting(meetingId)
    setMeetings((items) => items.filter((meeting) => meeting.id !== meetingId))
  }

  const createMeetingFolder = async (name) => {
    const data = await createFolderApi({ name })
    const folder = normalizeFolder(data)
    setFolders((items) => [folder, ...items.filter((item) => item.id !== folder.id)])
    await loadFolders()
    return folder
  }

  const renameMeetingFolder = async (folderId, name) => {
    const previousFolders = folders
    setFolders((items) =>
      items.map((folder) => (folder.id === folderId ? { ...folder, name } : folder)),
    )

    try {
      const data = await updateFolderApi(folderId, { name })
      const folder = normalizeFolder(data, 0, { id: folderId, name })
      setFolders((items) =>
        items.map((item) => (item.id === folderId || item.id === folder.id ? folder : item)),
      )
    } catch (error) {
      setFolders(previousFolders)
      throw error
    }
  }

  const deleteMeetingFolder = async (folderId) => {
    const previousFolders = folders
    setFolders((items) => items.filter((folder) => folder.id !== folderId))

    try {
      await deleteFolderApi(folderId)
      setFolderMeetings((items) => {
        const nextItems = { ...items }
        delete nextItems[folderId]
        return nextItems
      })
    } catch (error) {
      setFolders(previousFolders)
      throw error
    }
  }

  const loadMeetingsForFolder = useCallback(async (folderId, force = false) => {
    if (!force && folderMeetingsRef.current[folderId]) {
      return folderMeetingsRef.current[folderId]
    }

    setFolderMeetingsLoading((items) => ({ ...items, [folderId]: true }))
    try {
      const data = await getFolderMeetings(folderId)
      const nextMeetings = normalizeFolderMeetings(data)
      setFolderMeetings((items) => ({ ...items, [folderId]: nextMeetings }))
      return nextMeetings
    } finally {
      setFolderMeetingsLoading((items) => ({ ...items, [folderId]: false }))
    }
  }, [])

  const addMeetingToFolder = async (folderId, meetingId) => {
    await addMeetingToFolderApi(folderId, meetingId)
    await loadMeetingsForFolder(folderId, true)
  }

  const removeMeetingFromFolder = async (folderId, meetingId) => {
    const previousMeetings = folderMeetings[folderId] || []
    setFolderMeetings((items) => ({
      ...items,
      [folderId]: previousMeetings.filter((meeting) => meeting.id !== meetingId),
    }))

    try {
      await removeMeetingFromFolderApi(folderId, meetingId)
    } catch (error) {
      setFolderMeetings((items) => ({ ...items, [folderId]: previousMeetings }))
      throw error
    }
  }

  const loadGeneralChat = useCallback(async (chatId) => {
    if (!isApiChatId(chatId)) {
      return
    }

    try {
      const data = await getChatDetail(chatId)
      setGeneralChats((items) => {
        const fallback = items.find((chat) => chat.id === chatId)
        const chat = normalizeChat(data, fallback)
        return items.map((item) => (item.id === chat.id || item.id === chatId ? chat : item))
      })
    } catch (error) {
      console.error('Get chat detail API failed:', error)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-text-primary">
      <Sidebar
        dropdownOpen={dropdownOpen}
        mobileOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleDropdown={() => setDropdownOpen((value) => !value)}
        onCloseDropdown={() => setDropdownOpen(false)}
        onToggleMobile={() => setSidebarOpen((value) => !value)}
        onCloseMobile={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onLogout={logout}
        onOpenProfile={openProfile}
        authUser={authUser}
        generalChats={generalChats}
        chatsLoading={chatsLoading}
        meetings={meetings}
        meetingsLoading={meetingsLoading}
        folders={folders}
        foldersLoading={foldersLoading}
        foldersError={foldersError}
        folderMeetings={folderMeetings}
        folderMeetingsLoading={folderMeetingsLoading}
        onCreateGeneralChat={createGeneralChat}
        onRenameGeneralChat={renameGeneralChat}
        onDeleteGeneralChat={deleteGeneralChat}
        onRenameMeeting={renameMeetingHistory}
        onDeleteMeeting={deleteMeetingHistory}
        onCreateFolder={createMeetingFolder}
        onRenameFolder={renameMeetingFolder}
        onDeleteFolder={deleteMeetingFolder}
        onLoadFolderMeetings={loadMeetingsForFolder}
        onAddMeetingToFolder={addMeetingToFolder}
        onRemoveMeetingFromFolder={removeMeetingFromFolder}
      />
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg border border-border-soft bg-white p-2 shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <main className={`min-h-screen transition-[padding] duration-300 ${sidebarCollapsed ? 'lg:pl-[84px]' : 'lg:pl-[250px]'}`}>
        <Outlet
          context={{
            generalChats,
            createGeneralChat,
            updateGeneralChatMessages,
            loadGeneralChat,
            meetings,
            meetingsLoading,
            refreshMeetings,
            deleteMeeting: deleteMeetingHistory,
            folders,
            foldersLoading,
            foldersError,
            folderMeetings,
            folderMeetingsLoading,
            loadFolderMeetings: loadMeetingsForFolder,
            addMeetingToFolder,
            removeMeetingFromFolder,
            authUser,
            onUserUpdated: setAuthUser,
          }}
        />
      </main>
    </div>
  )
}

export default MainLayout
