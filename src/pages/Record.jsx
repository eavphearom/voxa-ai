import { ArrowLeft, CalendarDays, Expand, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AudioPlayer from '../components/AudioPlayer'
import ChatInput from '../components/ChatInput'

const liveTranscript = [
  {
    code: 'S1',
    speaker: 'Speaker 1',
    text: 'Welcome everyone. Today we are recording this meeting with VOXA AI.',
  },
  {
    code: 'S1',
    speaker: 'Speaker 1',
    text: 'The system is converting speech into text automatically while the user is speaking.',
  },
  {
    code: 'S2',
    speaker: 'Speaker 2',
    text: 'After the recording, VOXA AI can generate a summary, action items, and key decisions.',
  },
]

function Record() {
  const navigate = useNavigate()
  const [visibleLines, setVisibleLines] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return undefined

    const timer = setInterval(() => {
      setSeconds((value) => value + 1)
      setVisibleLines((value) => Math.min(value + 1, liveTranscript.length))
    }, 1800)

    return () => clearInterval(timer)
  }, [paused])

  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const shareRecording = async () => {
    const link = `${window.location.origin}/record`
    try {
      await navigator.clipboard.writeText(link)
      window.alert('Recording link copied to clipboard.')
    } catch {
      window.alert(`Share this link: ${link}`)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_390px] animate-fade-in">
      <section className="relative flex min-h-screen flex-col border-r border-border-soft">
        <header className="flex h-20 items-center justify-between border-b border-border-soft px-5 md:px-10">
          <Link to="/" className="rounded-full bg-slate-100 p-3 hover:bg-slate-200" aria-label="Back to home">
            <ArrowLeft size={20} />
          </Link>
          <button type="button" onClick={shareRecording} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-white hover:bg-emerald-600">
            <Share2 size={18} />
            Share
          </button>
        </header>

        <div className="flex-1 px-5 py-8 pb-28 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold italic text-slate-300">Note</h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              {paused ? 'Paused' : 'Recording'} {time}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-text-secondary">
            <span className="flex items-center gap-2"><CalendarDays size={17} />Apr 25, 2026</span>
            <span>1:33 AM</span>
          </div>

          <div className="mt-8 space-y-6 border-t border-border-soft pt-6">
            {liveTranscript.slice(0, visibleLines).map((line, index) => (
              <div key={`${line.code}-${index}`} className="grid gap-4 sm:grid-cols-[34px_1fr] animate-fade-in">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-500 text-xs font-bold text-white">{line.code}</span>
                <div>
                  <h2 className="mb-3 font-bold text-text-primary">{line.speaker}</h2>
                  <p className="max-w-2xl text-sm leading-7 text-text-primary">{line.text}</p>
                </div>
              </div>
            ))}
            {visibleLines < liveTranscript.length && (
              <p className="pl-12 text-xs font-semibold text-primary">Listening and converting speech to text...</p>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 left-5 right-5 md:left-10 md:right-10">
          <AudioPlayer
            recording
            paused={paused}
            elapsed={time}
            onPause={() => setPaused((value) => !value)}
            onStop={() => navigate('/meeting/recorded-meeting')}
          />
        </div>
      </section>

      <aside className="flex min-h-[520px] flex-col">
        <header className="flex h-20 items-center justify-between border-b border-border-soft px-6">
          <h2 className="font-bold">Chat</h2>
          <Expand size={19} />
        </header>
        <div className="flex-1" />
        <div className="p-5">
          <ChatInput onSend={(message) => console.log('Record chat:', message)} />
        </div>
      </aside>
    </div>
  )
}

export default Record
