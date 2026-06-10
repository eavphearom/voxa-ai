import { ChevronDown, PenSquare, Share2 } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'
import { staticAiReply, suggestions } from '../data/mockData'

function VoxaAI() {
  const navigate = useNavigate()
  const { chatId } = useParams()
  const { generalChats, createGeneralChat, updateGeneralChatMessages } = useOutletContext()
  const activeChat = useMemo(
    () => generalChats.find((chat) => chat.id === chatId) || generalChats[0],
    [chatId, generalChats],
  )
  const messages = activeChat?.messages || []

  const shareChat = async () => {
    const link = `${window.location.origin}/voxa-ai/${activeChat?.id || ''}`
    try {
      await navigator.clipboard.writeText(link)
      window.alert('VOXA AI chat link copied to clipboard.')
    } catch {
      window.alert(`Share this link: ${link}`)
    }
  }

  const sendMessage = (message) => {
    const targetChatId = activeChat?.id || startNewChat()
    updateGeneralChatMessages(targetChatId, (items) => {
      const nextIndex = items.length + 1
      return [
        ...items,
        { id: `${targetChatId}-user-${nextIndex}`, role: 'user', message, createdAt: 'Now' },
        { id: `${targetChatId}-ai-${nextIndex + 1}`, role: 'ai', message: staticAiReply, createdAt: 'Now' },
      ]
    })
  }

  const startNewChat = () => {
    const id = createGeneralChat()
    navigate(`/voxa-ai/${id}`)
    return id
  }

  return (
    <div className="flex min-h-screen flex-col px-5 py-7 md:px-10 animate-fade-in">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-text-primary">
          <span className="truncate">{activeChat?.title || 'VOXA'}</span>
          <ChevronDown size={15} />
        </button>
        <div className="flex gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200"
            type="button"
            onClick={startNewChat}
          >
            <PenSquare size={18} />
            New
          </button>
          <button onClick={shareChat} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#25A86A]" type="button">
            <Share2 size={18} />
            Share
          </button>
        </div>
      </header>

      <div key={activeChat?.id || 'empty'} className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8 py-10 animate-fade-in">
        {messages.length === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
                className="rounded-2xl border border-border-soft bg-white p-5 text-left text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-[#EAFBF3] hover:shadow-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </div>

      <div className="sticky bottom-5">
        <ChatInput onSend={sendMessage} placeholder="What would you like to know?" />
      </div>
    </div>
  )
}

export default VoxaAI
