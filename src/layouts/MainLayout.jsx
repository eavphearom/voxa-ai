import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import ProfileModal from '../components/ProfileModal'
import Sidebar from '../components/Sidebar'
import { generalChats as initialGeneralChats } from '../data/mockData'

function MainLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [generalChats, setGeneralChats] = useState(initialGeneralChats)

  const openProfile = () => {
    setDropdownOpen(false)
    setProfileOpen(true)
  }

  const createGeneralChat = () => {
    const id = `general-chat-${generalChats.length + 1}`
    const chat = {
      id,
      title: `New Chat ${generalChats.length + 1}`,
      updatedAt: 'Now',
      messages: [],
    }
    setGeneralChats((items) => [chat, ...items])
    return id
  }

  const updateGeneralChatMessages = (chatId, updater) => {
    setGeneralChats((items) =>
      items.map((chat) =>
        chat.id === chatId
          ? { ...chat, updatedAt: 'Now', messages: updater(chat.messages) }
          : chat,
      ),
    )
  }

  const renameGeneralChat = (chatId, title) => {
    setGeneralChats((items) =>
      items.map((chat) => (chat.id === chatId ? { ...chat, title, updatedAt: 'Now' } : chat)),
    )
  }

  const deleteGeneralChat = (chatId) => {
    setGeneralChats((items) => items.filter((chat) => chat.id !== chatId))
  }

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
        onOpenProfile={openProfile}
        generalChats={generalChats}
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
        <Outlet context={{ generalChats, createGeneralChat, updateGeneralChatMessages }} />
      </main>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}

export default MainLayout
