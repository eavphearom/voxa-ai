import { ChevronDown, PenSquare, Share2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'
import { staticAiReply, suggestions } from '../data/mockData'
import { createChatMessage, isApiChatId, normalizeCreatedMessage } from '../services/authApi'

function VoxaAI() {
  const navigate = useNavigate()
  const { chatId } = useParams()
  const { generalChats, createGeneralChat, updateGeneralChatMessages, loadGeneralChat } = useOutletContext()
  const activeChat = useMemo(
    () => generalChats.find((chat) => chat.id === chatId) || generalChats[0],
    [chatId, generalChats],
  )
  const messages = activeChat?.messages || []

  useEffect(() => {
    if (chatId) {
      loadGeneralChat(chatId)
    }
  }, [chatId, loadGeneralChat])

  const shareChat = async () => {
    const link = `${window.location.origin}/voxa-ai/${activeChat?.id || ''}`
    try {
      await navigator.clipboard.writeText(link)
      window.alert('VOXA AI chat link copied to clipboard.')
    } catch {
      window.alert(`Share this link: ${link}`)
    }
  }

  const buildFallbackMessages = (targetChatId, items, message, attachments, waitForApi) => {
      const nextIndex = items.length + 1
      const localAttachments = attachments.map((file, index) => {
        const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(file.name)

        return {
          id: `${targetChatId}-attachment-${nextIndex}-${index}`,
          name: file.name,
          type: file.type,
          url: '',
          previewUrl: isImage ? URL.createObjectURL(file) : '',
          isImage,
        }
      })
      const userMessage = message || ''
      const aiMessage = waitForApi
        ? {
            id: `${targetChatId}-ai-${nextIndex + 1}`,
            role: 'ai',
            message: 'VOXA is thinking...',
            createdAt: 'Now',
            pending: true,
          }
        : {
            id: `${targetChatId}-ai-${nextIndex + 1}`,
            role: 'ai',
            message: staticAiReply,
            createdAt: 'Now',
          }

      return [
        ...items,
        {
          id: `${targetChatId}-user-${nextIndex}`,
          role: 'user',
          message: userMessage,
          attachments: localAttachments,
          createdAt: 'Now',
        },
        aiMessage,
      ]
  }

  const sendMessage = async (payload) => {
    const message = typeof payload === 'string' ? payload : payload.message
    const attachments = typeof payload === 'string' ? [] : payload.attachments || []
    const targetChatId = activeChat?.id || (await startNewChat())
    const shouldUseApi = isApiChatId(targetChatId)

    if (!targetChatId) {
      throw new Error('Unable to create chat before sending message.')
    }

    updateGeneralChatMessages(targetChatId, (items) =>
      {
        const nextMessages = buildFallbackMessages(targetChatId, items, message, attachments, shouldUseApi)
        console.log('Message state after optimistic send:', nextMessages)
        return nextMessages
      },
    )

    if (!shouldUseApi) {
      return
    }

    try {
      const data = await createChatMessage(targetChatId, { message, attachments })
      updateGeneralChatMessages(targetChatId, (items) =>
        {
          const nextMessages = normalizeCreatedMessage(data, items)
          console.log('Message state after API response:', nextMessages)
          return nextMessages
        },
      )
    } catch (error) {
      console.error('Create chat message API failed:', error)
      updateGeneralChatMessages(targetChatId, (items) =>
        items.map((item) =>
          item.pending
            ? {
                ...item,
                pending: false,
                error: true,
                message: error.message || 'The server did not send a response. Please try again.',
              }
            : item,
        ),
      )
      throw error
    }
  }

  const startNewChat = async () => {
    const id = await createGeneralChat(activeChat?.id)
    if (id) {
      navigate(`/voxa-ai/${id}`)
    }
    return id
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white animate-fade-in">
      <header className="sticky top-0 z-20 flex min-h-[80px] flex-wrap items-center justify-between gap-4  border-border-soft bg-white/95 px-5 py-6 backdrop-blur md:px-10">
        <button type="button" className="inline-flex min-w-0 items-center gap-2 text-lg font-semibold text-text-primary">
          <span className="truncate">{activeChat?.title || 'VOXA'}</span>
          <ChevronDown size={17} />
        </button>
        <div className="flex gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3.5 text-base font-semibold transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200"
            type="button"
            onClick={startNewChat}
          >
            <PenSquare size={19} />
            New
          </button>
          <button onClick={shareChat} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#25A86A]" type="button">
            <Share2 size={19} />
            Share
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 md:px-10">
        <div key={activeChat?.id || 'empty'} className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center gap-8 pb-32 pt-10 animate-fade-in">
          {messages.length === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-2xl border border-border-soft bg-white p-5 text-left text-base font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-[#EAFBF3] hover:shadow-md"
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20  bg-white px-5 pb-10  md:px-10">
        <ChatInput onSend={sendMessage} placeholder="What would you like to know?" />
      </div>
    </div>
  )
}

export default VoxaAI
