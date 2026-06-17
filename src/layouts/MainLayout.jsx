import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import ProfileModal from '../components/ProfileModal'
import Sidebar from '../components/Sidebar'
import {
  clearAuth,
  createChat,
  deleteChat,
  getChats,
  getChatDetail,
  getStoredUser,
  isApiChatId,
  logoutUser,
  normalizeChat,
  normalizeChats,
  updateChat,
} from '../services/authApi'

function MainLayout() {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [generalChats, setGeneralChats] = useState([])
  const [chatsLoading, setChatsLoading] = useState(true)
  const [authUser, setAuthUser] = useState(() => getStoredUser())
  const creatingChatRef = useRef(false)

  const openProfile = () => {
    setDropdownOpen(false)
    setProfileOpen(true)
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
        onToggleMobile={() => setSidebarOpen((value) => !value)}
        onCloseMobile={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onLogout={logout}
        onOpenProfile={openProfile}
        authUser={authUser}
        generalChats={generalChats}
        chatsLoading={chatsLoading}
        onCreateGeneralChat={createGeneralChat}
        onRenameGeneralChat={renameGeneralChat}
        onDeleteGeneralChat={deleteGeneralChat}
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
        <Outlet context={{ generalChats, createGeneralChat, updateGeneralChatMessages, loadGeneralChat }} />
      </main>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} user={authUser} />
    </div>
  )
}

export default MainLayout
