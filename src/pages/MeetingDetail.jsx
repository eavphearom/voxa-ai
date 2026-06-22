import { ArrowLeft, Bot, CalendarDays, ChevronDown, Clock3, Edit3, Expand, Plus, Share2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AudioPlayer from '../components/AudioPlayer'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'
import TranscriptView from '../components/TranscriptView'
import {
  buildMediaUrl,
  createChatMessage,
  getChatDetail,
  getMeetingDetail,
  normalizeChat,
  normalizeCreatedMessage,
} from '../services/authApi'

function MeetingDetail() {
  const { id } = useParams()
  return <MeetingDetailContent key={id} meetingId={id} />
}

function MeetingDetailContent({ meetingId }) {
  const [meeting, setMeeting] = useState(null)
  const [meetingChat, setMeetingChat] = useState(null)
  const [generalChat, setGeneralChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Summary')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [chatHistories, setChatHistories] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [statusRefresh, setStatusRefresh] = useState(0)
  const activeChat = chatHistories.find((chat) => chat.id === activeChatId) || chatHistories[0]

  useEffect(() => {
    let ignore = false

    async function loadMeetingGeneralChat() {
      setChatHistories([])
      setActiveChatId(null)
      setLoading(true)
      setError('')

      try {
        const meetingResponse = await getMeetingDetail(meetingId)
        const payload = meetingResponse.data?.data || meetingResponse.data || meetingResponse
        const nextMeeting = payload.meeting || null
        const nextMeetingChat = payload.meeting_chat || null
        const nextGeneralChat = payload.general_chat || null

        console.log('Meeting:', nextMeeting)
        console.log('Meeting Chat:', nextMeetingChat)
        console.log('General Chat:', nextGeneralChat)

        if (ignore) return

        setMeeting(nextMeeting)
        setMeetingChat(nextMeetingChat)
        setGeneralChat(nextGeneralChat)

        if (!nextGeneralChat?.id) {
          console.error('Meeting detail response does not contain general_chat.id:', meetingResponse)
          return
        }

        const chatResponse = await getChatDetail(nextGeneralChat.id)
        if (ignore) return

        const chat = normalizeChat(chatResponse, {
          id: String(nextGeneralChat.id),
          title: nextGeneralChat.title,
          messages: [],
        })
        setChatHistories([chat])
        setActiveChatId(chat.id)
      } catch (error) {
        console.error('Load meeting general chat failed:', error)
        if (!ignore) {
          setError(error.message)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadMeetingGeneralChat()
    return () => {
      ignore = true
    }
  }, [meetingId, statusRefresh])

  useEffect(() => {
    if (!meeting?.id || !isProcessingStatus(meeting.status)) return undefined

    const timer = window.setInterval(async () => {
      try {
        const response = await getMeetingDetail(meeting.id)
        const payload = response.data?.data || response.data || response
        setMeeting(payload.meeting || null)
        setMeetingChat(payload.meeting_chat || null)
        setGeneralChat(payload.general_chat || null)
      } catch (pollError) {
        console.error('Poll meeting status failed:', pollError)
        setError(pollError.message)
      }
    }, 4000)

    return () => window.clearInterval(timer)
  }, [meeting?.id, meeting?.status])

  const shareMeeting = async () => {
    const link = `${window.location.origin}/meeting/${meeting?.id || meetingId}`
    try {
      await navigator.clipboard.writeText(link)
      window.alert('Meeting link copied to clipboard.')
    } catch {
      window.alert(`Share this link: ${link}`)
    }
  }

  const sendAssistantMessage = async (payload) => {
    if (!generalChat?.id) {
      throw new Error('This meeting does not have a general chat yet.')
    }

    const generalChatId = String(generalChat.id)
    const message = typeof payload === 'string' ? payload : payload.message || ''
    const attachments = typeof payload === 'string' ? [] : payload.attachments || []
    const response = await createChatMessage(generalChatId, { message, attachments })

    try {
      const chatResponse = await getChatDetail(generalChatId)
      const chat = normalizeChat(chatResponse, activeChat || {
        id: generalChatId,
        title: generalChat.title,
      })
      setChatHistories([chat])
      setActiveChatId(chat.id)
    } catch (refreshError) {
      console.error('Refresh meeting general chat failed:', refreshError)
      setChatHistories((histories) =>
        histories.map((chat) =>
          chat.id === String(generalChatId)
            ? { ...chat, messages: normalizeCreatedMessage(response, chat.messages) }
            : chat,
        ),
      )
    }
  }

  const createNewChat = () => {
    // A meeting owns one API-provided General Chat; this action simply reopens it.
    if (generalChat?.id) {
      setActiveChatId(String(generalChat.id))
    }
    return generalChat?.id || null
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
          <h1 className="text-2xl font-semibold text-text-primary md:text-3xl">
            {meeting?.title || 'Loading meeting...'}
          </h1>
          {meeting?.file_name && (
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">{meeting.file_name}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-5 text-sm font-medium text-text-primary">
            {meeting?.created_at && (
              <span className="flex items-center gap-2">
                <CalendarDays size={17} />
                {formatCreatedAt(meeting.created_at)}
              </span>
            )}
            {meeting?.status && (
              <span className="flex items-center gap-2 capitalize">
                <Clock3 size={17} />
                {meeting.status}
              </span>
            )}
            {meeting?.language && <span className="uppercase">Language: {meeting.language}</span>}
            {meeting?.duration != null && <span>Duration: {formatDuration(meeting.duration)}</span>}
          </div>

          {isProcessingStatus(meeting?.status) && <MeetingProcessingStatus status={meeting.status} />}
          {meeting?.status === 'failed' && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span>Meeting processing failed.</span>
              <button type="button" onClick={() => setStatusRefresh((value) => value + 1)} className="font-semibold underline">Retry</button>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

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
            {/* <button type="button" className="hidden items-center gap-2 text-sm font-semibold transition hover:text-primary md:flex">
              <Edit3 size={17} />
              Edit Transcript
            </button> */}
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="rounded-2xl border border-border-soft bg-white p-6 text-sm text-text-secondary">
                Loading meeting detail...
              </div>
            ) : (
              <>
                {tab === 'Summary' && (
                  <SummaryTab meeting={meeting} meetingChat={meetingChat} generalChat={generalChat} />
                )}
                {tab === 'Transcript' && <TranscriptTab transcript={meetingChat?.transcript} />}
                {tab === 'Insights' && (
                  <InsightsTab meeting={meeting} meetingChat={meetingChat} generalChat={generalChat} />
                )}
              </>
            )}
          </div>
        </div>

        {!loading && (
          <div className="shrink-0 border-t border-border-soft bg-white p-3 md:px-10">
            <AudioPlayer
              src={buildMediaUrl(meeting?.file_path)}
              fileName={meeting?.file_name}
            />
          </div>
        )}
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

function SummaryTab({ meeting, meetingChat, generalChat }) {
  return (
    <div className="space-y-5 text-sm leading-7 text-text-primary">
      <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Meeting information</h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailField label="Title" value={meeting?.title} />
          <DetailField label="File name" value={meeting?.file_name} />
          <DetailField label="Status" value={meeting?.status} />
          <DetailField label="Created at" value={formatCreatedAt(meeting?.created_at)} />
        </dl>
      </section>
      {/* <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Meeting chats</h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailField label="Meeting chat ID" value={meetingChat?.id} />
          <DetailField label="Meeting chat title" value={meetingChat?.title} />
          <DetailField label="General chat ID" value={generalChat?.id} />
          <DetailField label="General chat title" value={generalChat?.title} />
        </dl>
      </section> */}
    </div>
  )
}

function TranscriptTab({ transcript }) {
  return (
    <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
      <TranscriptView transcript={transcript} />
    </section>
  )
}

function InsightsTab({ meeting, meetingChat, generalChat }) {
  const insights = [
    ['Meeting status', meeting?.status],
    ['File name', meeting?.file_name],
    ['Language', meeting?.language],
    ['Duration', formatDuration(meeting?.duration)],
    ['Meeting chat ID', meetingChat?.id],
    ['General chat', generalChat?.title],
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

function DetailField({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-text-secondary">{label}</dt>
      <dd className="mt-1 break-words font-medium text-text-primary">{value || '-'}</dd>
    </div>
  )
}

function formatCreatedAt(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function formatDuration(value) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds)) return value || '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remaining = Math.floor(seconds % 60)
  return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : '', `${remaining}s`].filter(Boolean).join(' ')
}

function isProcessingStatus(status) {
  return ['processing', 'uploaded', 'transcribing', 'analyzing'].includes(status)
}

function MeetingProcessingStatus({ status }) {
  const labels = {
    processing: 'Processing meeting...',
    uploaded: 'Preparing meeting...',
    transcribing: 'Transcribing audio...',
    analyzing: 'Detecting speakers...',
  }
  return (
    <div className="mt-5 flex items-center gap-3 rounded-xl border border-primary/20 bg-[#EAFBF3] px-4 py-3 text-sm font-medium text-text-primary">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      {labels[status] || 'Processing meeting...'}
    </div>
  )
}

export default MeetingDetail
