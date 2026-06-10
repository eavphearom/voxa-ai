import { ArrowLeft, Bot, CalendarDays, ChevronDown, Clock3, Edit3, Expand, Plus, Share2, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AudioPlayer from '../components/AudioPlayer'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'
import {
  getMeetingById,
  staticAiReply,
  suggestions,
  summaryData,
  transcriptItems,
} from '../data/mockData'

function MeetingDetail() {
  const { id } = useParams()
  const meeting = getMeetingById(id)

  return <MeetingDetailContent key={meeting.id} meeting={meeting} />
}

function MeetingDetailContent({ meeting }) {
  const [tab, setTab] = useState('Summary')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [chatHistories, setChatHistories] = useState(() => meeting.chats || [])
  const [activeChatId, setActiveChatId] = useState(() => meeting.chats?.[0]?.id || null)
  const activeChat = chatHistories.find((chat) => chat.id === activeChatId) || chatHistories[0]

  const shareMeeting = async () => {
    const link = `${window.location.origin}/meeting/${meeting.id}`
    try {
      await navigator.clipboard.writeText(link)
      window.alert('Meeting link copied to clipboard.')
    } catch {
      window.alert(`Share this link: ${link}`)
    }
  }

  const sendAssistantMessage = (message) => {
    const targetChatId = activeChat?.id || createNewChat()
    setChatHistories((histories) =>
      histories.map((chat) =>
        chat.id === targetChatId
          ? appendAssistantMessages(chat, message)
          : chat,
      ),
    )
  }

  const createNewChat = () => {
    const id = `${meeting.id}-chat-${chatHistories.length + 1}`
    const newChat = {
      id,
      title: `New Chat ${chatHistories.length + 1}`,
      updatedAt: 'Now',
      messages: [],
    }
    setChatHistories((histories) => [newChat, ...histories])
    setActiveChatId(id)
    return id
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_390px] animate-fade-in">
      <section className="relative flex h-screen min-h-0 flex-col overflow-hidden border-r border-border-soft">
        <header className="flex h-20 items-center justify-between border-b border-border-soft px-5 md:px-10">
          <Link to="/" className="rounded-full bg-slate-100 p-3 transition hover:bg-slate-200" aria-label="Go back">
            <ArrowLeft size={20} />
          </Link>
          <button type="button" onClick={shareMeeting} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#25A86A]">
            <Share2 size={18} />
            Share
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 md:px-10">
          <h1 className="text-2xl font-semibold text-text-primary md:text-3xl">{meeting.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">{meeting.summaryPreview}</p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm font-medium text-text-primary">
            <span className="flex items-center gap-2"><CalendarDays size={17} />{meeting.date}</span>
            <span>{meeting.time}</span>
            <span className="flex items-center gap-2"><Clock3 size={17} />{meeting.duration}</span>
          </div>

          <div className="mt-8 flex items-center justify-between border-b border-border-soft">
            <div className="flex gap-5 overflow-x-auto">
              {['Summary', 'Transcript', 'Insights'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`shrink-0 border-b-2 py-3 text-sm font-semibold transition-all duration-200 ${
                    tab === item ? 'border-primary text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <button type="button" className="hidden items-center gap-2 text-sm font-semibold transition hover:text-primary md:flex">
              <Edit3 size={17} />
              Edit Transcript
            </button>
          </div>

          <div className="mt-6">
            {tab === 'Summary' && <SummaryTab />}
            {tab === 'Transcript' && <TranscriptTab />}
            {tab === 'Insights' && <InsightsTab meeting={meeting} />}
          </div>
        </div>

        <div className="shrink-0 border-t border-border-soft bg-white p-3 md:px-10">
          <AudioPlayer />
        </div>
      </section>

      <aside className="hidden h-screen flex-col bg-white lg:sticky lg:top-0 lg:flex">
        <AssistantPanel
          chats={chatHistories}
          activeChatId={activeChat?.id}
          messages={activeChat?.messages || []}
          onNewChat={createNewChat}
          onSelectChat={setActiveChatId}
          onSend={sendAssistantMessage}
        />
      </aside>

      <button
        type="button"
        onClick={() => setAssistantOpen(true)}
        className="fixed right-4 top-1/2 z-40 flex h-13 w-13 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-xl transition hover:scale-[1.04] hover:bg-[#25A86A] lg:hidden"
        aria-label="Open AI Assistant"
      >
        <Bot size={23} />
      </button>

      {assistantOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setAssistantOpen(false)}
            aria-label="Close AI Assistant overlay"
          />
          <aside className="fixed bottom-0 right-0 top-0 flex h-dvh w-[min(92vw,390px)] flex-col overflow-hidden bg-white shadow-2xl animate-fade-in">
            <AssistantPanel
              chats={chatHistories}
              activeChatId={activeChat?.id}
              messages={activeChat?.messages || []}
              onNewChat={createNewChat}
              onSelectChat={setActiveChatId}
              onSend={sendAssistantMessage}
              onClose={() => setAssistantOpen(false)}
            />
          </aside>
        </div>
      )}
    </div>
  )
}

function appendAssistantMessages(chat, message) {
  const nextIndex = chat.messages.length + 1

  return {
    ...chat,
    updatedAt: 'Now',
    messages: [
      ...chat.messages,
      { id: `${chat.id}-user-${nextIndex}`, role: 'user', message, createdAt: 'Now' },
      { id: `${chat.id}-ai-${nextIndex + 1}`, role: 'ai', message: staticAiReply, createdAt: 'Now' },
    ],
  }
}

function AssistantPanel({ chats, activeChatId, messages, onNewChat, onSelectChat, onSend, onClose }) {
  return (
    <>
      <header className="shrink-0 border-b border-border-soft px-5 py-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">AI Assistant</h2>
          {onClose ? (
            <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:bg-slate-100" aria-label="Close AI Assistant">
              <X size={19} />
            </button>
          ) : (
            <Expand size={19} />
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onNewChat}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#25A86A]"
          >
            <Plus size={16} />
            New Chat
          </button>
          <ChatHistoryDropdown chats={chats} activeChatId={activeChatId} onSelectChat={onSelectChat} />
        </div>
      </header>
      <div key={activeChatId} className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-5 sm:p-6 animate-fade-in">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSend(suggestion)}
              className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold transition hover:bg-[#EAFBF3] hover:text-primary"
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border-soft p-5 text-center">
            <p className="text-sm font-semibold text-text-primary">Start a new AI chat</p>
            <p className="mt-1 text-xs text-text-secondary">Ask about this meeting summary, transcript, tasks, or translation.</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <div className="sticky bottom-0 shrink-0 border-t border-border-soft bg-white p-4 sm:p-5">
        <ChatInput onSend={onSend} />
      </div>
    </>
  )
}

function ChatHistoryDropdown({ chats, activeChatId, onSelectChat }) {
  const [open, setOpen] = useState(false)
  const activeChat = chats.find((chat) => chat.id === activeChatId)

  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-border-soft bg-white px-3 text-left text-sm font-semibold text-text-primary transition hover:border-primary hover:bg-[#EAFBF3]"
      >
        <span className="truncate">{activeChat?.title || 'Select chat'}</span>
        <ChevronDown size={16} className={`shrink-0 text-text-secondary transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-30 max-h-72 w-full overflow-y-auto rounded-2xl border border-border-soft bg-white p-2 shadow-xl animate-fade-in">
          {chats.map((chat) => {
            const active = chat.id === activeChatId
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => {
                  onSelectChat(chat.id)
                  setOpen(false)
                }}
                className={`mb-1 block w-full rounded-xl px-3 py-2 text-left transition ${
                  active ? 'bg-[#EAFBF3] text-primary' : 'hover:bg-slate-50'
                }`}
              >
                <span className="block truncate text-sm font-semibold">{chat.title}</span>
                <span className="mt-0.5 block text-xs text-text-secondary">{chat.messages.length} messages - {chat.updatedAt}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryTab() {
  return (
    <div className="space-y-5 text-sm leading-7 text-text-primary">
      <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-base font-semibold">AI overview</h3>
        <p>{summaryData.overview}</p>
      </section>
      <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-base font-semibold">Action items</h3>
        <ul className="list-disc space-y-2 pl-5">
          {summaryData.actionItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-base font-semibold">Key decisions</h3>
        <ul className="list-disc space-y-2 pl-5">
          {summaryData.decisions.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </div>
  )
}

function TranscriptTab() {
  return (
    <div className="space-y-5">
      {transcriptItems.map((line) => (
        <div key={line.id} className="grid gap-4 rounded-2xl border border-border-soft bg-white p-5 shadow-sm sm:grid-cols-[36px_1fr]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{line.code}</span>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h3 className="font-semibold">{line.speaker}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-text-secondary">{line.timestamp}</span>
            </div>
            <p className="text-sm leading-7 text-text-primary">{line.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function InsightsTab({ meeting }) {
  const insights = [
    ['Detected languages', summaryData.languages.join(', ')],
    ['Keywords', summaryData.keywords.join(', ')],
    ['Speaker count', `${meeting.speakers || summaryData.speakerCount} speakers`],
    ['Duration', meeting.duration || summaryData.duration],
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {insights.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-2 font-semibold text-text-primary">{value}</p>
        </div>
      ))}
    </div>
  )
}

export default MeetingDetail
